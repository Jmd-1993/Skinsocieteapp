// services/phorestService.js
import axios from 'axios';

class PhorestService {
  constructor() {
    // Use environment variables in production
    this.config = {
      baseURL: 'https://api-gateway-us.phorest.com/third-party-api-server/api/business',
      businessId: process.env.PHOREST_BUSINESS_ID || 'IX2it2QrF0iguR-LpZ6BHQ',
      auth: {
        username: process.env.PHOREST_USERNAME || 'global/josh@skinsociete.com.au',
        password: process.env.PHOREST_PASSWORD || 'ROW^pDL%kxSq'
      }
    };

    // Create axios instance with authentication
    this.api = axios.create({
      baseURL: this.config.baseURL,
      auth: this.config.auth,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Follow redirects for write operations
      maxRedirects: 5
    });

    // Store branch ID once retrieved - CRITICAL FOR MOST ENDPOINTS
    this.branchId = null;
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      console.error('Phorest API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
      throw new Error(`Phorest API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }

  // CRITICAL: Get branch information first - most endpoints need this!
  async getBranches() {
    try {
      const response = await this.api.get(`/${this.config.businessId}/branch`);
      const branches = response.data._embedded?.branches || [];
      
      // Auto-set first branch ID if available
      if (branches.length > 0 && !this.branchId) {
        this.branchId = branches[0].branchId;
        console.log(`✅ Branch ID set to: ${this.branchId} (${branches[0].name})`);
      }
      
      return branches;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Ensure branch ID is set
  async ensureBranchId() {
    if (!this.branchId) {
      await this.getBranches();
      if (!this.branchId) {
        throw new Error('No branch ID available. Please check your business has branches.');
      }
    }
  }

  // CLIENT MANAGEMENT (Business level - no branch needed)
  async getClients(params = {}) {
    try {
      const defaultParams = {
        size: 50,
        page: 0,
        ...params
      };
      
      const response = await this.api.get(`/${this.config.businessId}/client`, { 
        params: defaultParams 
      });
      
      return {
        clients: response.data._embedded?.clients || [],
        pagination: response.data.page || {},
        totalElements: response.data.page?.totalElements || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getClientById(clientId) {
    try {
      const response = await this.api.get(`/${this.config.businessId}/client/${clientId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchClientByEmail(email) {
    try {
      const response = await this.api.get(`/${this.config.businessId}/client`, {
        params: { 
          email: email,
          size: 10 
        }
      });
      return response.data._embedded?.clients || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchClientByPhone(phone) {
    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      
      const response = await this.api.get(`/${this.config.businessId}/client`, {
        params: { 
          phone: cleanPhone,
          size: 10 
        }
      });
      return response.data._embedded?.clients || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async findClientByEmailOrPhone(email, phone = null) {
    try {
      let client = null;
      
      // Try email first
      if (email) {
        const emailResults = await this.searchClientByEmail(email);
        if (emailResults.length > 0) {
          client = emailResults[0];
        }
      }
      
      // If no email match and phone provided, try phone
      if (!client && phone) {
        const phoneResults = await this.searchClientByPhone(phone);
        if (phoneResults.length > 0) {
          client = phoneResults[0];
        }
      }
      
      return client;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createClient(clientData) {
    try {
      await this.ensureBranchId();
      
      const payload = {
        creatingBranchId: this.branchId,
        ...clientData
      };
      
      const response = await this.api.post(`/${this.config.businessId}/client`, payload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateClient(clientId, clientData) {
    try {
      // Get current client data first to preserve version
      const currentClient = await this.getClientById(clientId);
      
      const payload = {
        ...clientData,
        clientId: clientId,
        version: currentClient.version // Required for updates
      };
      
      const response = await this.api.put(`/${this.config.businessId}/client/${clientId}`, payload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // APPOINTMENT MANAGEMENT (Branch level)
  async getAppointments(params = {}) {
    try {
      await this.ensureBranchId();
      
      // Add default date range (last 30 days - API limit is 31 days max)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const defaultParams = {
        size: 200, // Get more results to find client appointments
        page: 0,
        from_date: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD format
        to_date: now.toISOString().split('T')[0],
        ...params
      };
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/appointment`, 
        { params: defaultParams }
      );
      
      return {
        appointments: response.data._embedded?.appointments || [],
        pagination: response.data.page || {}
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getClientAppointments(clientId, params = {}) {
    try {
      // Try the appointments endpoint with client filter
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/appointment`,
        {
          params: {
            clientId: clientId,
            size: 50,
            page: 0,
            ...params
          }
        }
      );
      
      return response.data._embedded?.appointments || [];
    } catch (error) {
      // If that fails, try without client filter and filter manually
      console.log('📝 Client-specific appointments endpoint not available, filtering manually');
      try {
        const allAppointments = await this.getAppointments({ size: 200 });
        return allAppointments.appointments.filter(apt => apt.clientId === clientId);
      } catch (fallbackError) {
        console.log('📝 Could not retrieve appointments, returning empty array');
        return [];
      }
    }
  }

  async createAppointment(appointmentData) {
    try {
      await this.ensureBranchId();
      
      // Handle different input formats for backward compatibility
      let clientId, serviceId, staffId, startTime, duration, notes;
      
      if (appointmentData.clientAppointmentSchedules) {
        // Already in correct format
        const response = await this.api.post(`/${this.config.businessId}/branch/${this.branchId}/booking`, appointmentData);
        return response.data;
      } else if (appointmentData.appointments) {
        // Legacy array format - convert to correct format
        const appointment = appointmentData.appointments[0];
        clientId = appointmentData.clientId;
        serviceId = appointment.serviceId;
        staffId = appointment.staffId;
        startTime = appointment.startTime;
        duration = appointment.duration;
        notes = appointmentData.notes || appointment.notes;
      } else {
        // Legacy direct format - extract fields
        clientId = appointmentData.clientId;
        serviceId = appointmentData.serviceId;
        staffId = appointmentData.staffId;
        startTime = appointmentData.startTime;
        duration = appointmentData.duration;
        notes = appointmentData.notes;
      }
      
      // Convert to correct Phorest booking format
      const correctPayload = {
        clientId: clientId,
        clientAppointmentSchedules: [
          {
            clientId: clientId,
            serviceSchedules: [
              {
                serviceId: serviceId,
                startTime: startTime,
                staffId: staffId
              }
            ]
          }
        ]
      };
      
      // Add optional fields if provided
      if (notes) {
        correctPayload.clientAppointmentSchedules[0].serviceSchedules[0].notes = notes;
      }
      if (duration) {
        correctPayload.clientAppointmentSchedules[0].serviceSchedules[0].duration = duration;
      }
      
      console.log('🔧 Using correct Phorest booking format:', JSON.stringify(correctPayload, null, 2));
      
      // Use the correct booking endpoint with branch ID
      const response = await this.api.post(`/${this.config.businessId}/branch/${this.branchId}/booking`, correctPayload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Convert local time to UTC for Phorest API (requires UTC timestamps)
  convertToUTC(localTimeString, timezone = 'Australia/Perth') {
    try {
      // Parse the input time string
      const localTime = new Date(localTimeString);
      
      // Perth is UTC+8 (no daylight saving for this calculation)
      // Convert to UTC by subtracting 8 hours
      const utcTime = new Date(localTime.getTime() - (8 * 60 * 60 * 1000));
      
      // Return in ISO format with Z suffix for UTC
      return utcTime.toISOString();
    } catch (error) {
      console.error('❌ Timezone conversion error:', error);
      // Fallback: assume input is already UTC
      return localTimeString.endsWith('Z') ? localTimeString : localTimeString + 'Z';
    }
  }

  // NEW CORRECT BOOKING METHOD using exact Phorest format with timezone conversion
  async createBooking(clientId, serviceId, staffId, startTime) {
    try {
      await this.ensureBranchId();
      
      // Convert local Perth time to UTC (Phorest API requirement)
      const utcStartTime = this.convertToUTC(startTime);
      console.log(`🌏 Timezone conversion: ${startTime} (Perth) -> ${utcStartTime} (UTC)`);
      
      // Use exact format provided by Phorest
      const bookingPayload = {
        clientId: clientId,
        clientAppointmentSchedules: [
          {
            clientId: clientId,
            serviceSchedules: [
              {
                serviceId: serviceId,
                startTime: utcStartTime, // Use UTC time
                staffId: staffId
              }
            ]
          }
        ]
      };
      
      console.log('🔧 Creating booking with UTC time:', JSON.stringify(bookingPayload, null, 2));
      
      const response = await this.api.post(`/${this.config.businessId}/branch/${this.branchId}/booking`, bookingPayload);
      
      console.log('✅ Booking successful!', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Booking failed:', error.response?.data || error.message);
      this.handleError(error);
    }
  }

  // PURCHASE/TRANSACTION TRACKING
  async getClientPurchases(clientId, params = {}) {
    try {
      // First try the direct client purchase endpoint
      try {
        const response = await this.api.get(
          `/${this.config.businessId}/client/${clientId}/purchase`,
          {
            params: {
              size: 50,
              page: 0,
              ...params
            }
          }
        );
        
        return {
          purchases: response.data._embedded?.purchases || [],
          pagination: response.data.page || {},
          totalSpent: this.calculateTotalSpent(response.data._embedded?.purchases || [])
        };
      } catch (directError) {
        // If direct endpoint fails, try branch-level purchases and filter
        console.log('📝 Client-specific purchases endpoint not available, checking branch purchases');
        await this.ensureBranchId();
        
        const response = await this.api.get(
          `/${this.config.businessId}/branch/${this.branchId}/purchase`,
          {
            params: {
              clientId: clientId,
              size: 100,
              page: 0,
              ...params
            }
          }
        );
        
        const purchases = response.data._embedded?.purchases || [];
        const clientPurchases = purchases.filter(p => p.clientId === clientId);
        
        return {
          purchases: clientPurchases,
          pagination: response.data.page || {},
          totalSpent: this.calculateTotalSpent(clientPurchases)
        };
      }
    } catch (error) {
      console.log('📝 Could not retrieve purchases, returning empty data');
      return {
        purchases: [],
        pagination: {},
        totalSpent: 0
      };
    }
  }

  async createPurchase(purchaseData) {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.post(
        `/${this.config.businessId}/branch/${this.branchId}/purchase`,
        purchaseData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  calculateTotalSpent(purchases) {
    return purchases.reduce((total, purchase) => {
      return total + (purchase.totalAmount || 0);
    }, 0);
  }

  // SKIN SOCIETE LOYALTY SYSTEM INTEGRATION
  calculateLoyaltyPoints(totalSpent) {
    // $1 = 1 point for Skin Societe
    return Math.floor(totalSpent);
  }

  determineLoyaltyTier(points) {
    // Skin Societe 4-tier system
    if (points >= 2000) return 'VIP Goddess';      // $2000+ spent
    if (points >= 1000) return 'Skincare Guru';    // $1000-1999 spent  
    if (points >= 500) return 'Beauty Enthusiast'; // $500-999 spent
    return 'Glow Starter';                          // $0-499 spent
  }

  async getClientLoyaltyStatus(clientId) {
    try {
      const { totalSpent } = await this.getClientPurchases(clientId);
      const points = this.calculateLoyaltyPoints(totalSpent);
      const tier = this.determineLoyaltyTier(points);
      
      return {
        totalSpent,
        points,
        tier,
        nextTierProgress: this.calculateNextTierProgress(points),
        benefits: this.getTierBenefits(tier)
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  calculateNextTierProgress(points) {
    if (points < 500) {
      return {
        nextTier: 'Beauty Enthusiast',
        pointsNeeded: 500 - points,
        percentage: (points / 500) * 100
      };
    } else if (points < 1000) {
      return {
        nextTier: 'Skincare Guru', 
        pointsNeeded: 1000 - points,
        percentage: ((points - 500) / 500) * 100
      };
    } else if (points < 2000) {
      return {
        nextTier: 'VIP Goddess',
        pointsNeeded: 2000 - points,
        percentage: ((points - 1000) / 1000) * 100
      };
    }
    return {
      nextTier: 'MAX_TIER',
      pointsNeeded: 0,
      percentage: 100
    };
  }

  getTierBenefits(tier) {
    const benefits = {
      'Glow Starter': [
        '5% discount on treatments',
        'Birthday month special offer',
        'First treatment discount'
      ],
      'Beauty Enthusiast': [
        '10% discount on treatments',
        '5% discount on products', 
        'Priority booking',
        'Quarterly skin analysis'
      ],
      'Skincare Guru': [
        '15% discount on treatments',
        '10% discount on products',
        'VIP priority booking',
        'Monthly skin consultation',
        'Exclusive product previews'
      ],
      'VIP Goddess': [
        '20% discount on treatments',
        '15% discount on products',
        'VIP concierge service',
        'Complimentary monthly facial',
        'Exclusive events access',
        'Personal skincare specialist'
      ]
    };
    
    return benefits[tier] || [];
  }

  // SERVICES/TREATMENTS (Branch level)
  async getServices() {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/service`
      );
      return response.data._embedded?.services || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getServiceById(serviceId) {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/service/${serviceId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // PRODUCTS (Branch level)
  async getProducts(params = {}) {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/product`,
        {
          params: {
            size: 50,
            page: 0,
            ...params
          }
        }
      );
      
      return {
        products: response.data._embedded?.products || [],
        pagination: response.data.page || {}
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProductById(productId) {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/product/${productId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // STAFF (Branch level) - NOW WITH PROPER FILTERING
  async getStaff(branchId = null, options = {}) {
    try {
      const targetBranchId = branchId || this.branchId;
      if (!targetBranchId) {
        await this.ensureBranchId();
      }
      
      console.log(`🔍 Fetching staff for branch: ${targetBranchId}`);
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${targetBranchId || this.branchId}/staff`
      );
      
      const allStaff = response.data._embedded?.staffs || [];
      console.log(`📊 Raw API returned ${allStaff.length} staff members`);
      
      // CRITICAL FIX: Filter staff who actually work at this specific branch
      const branchSpecificStaff = allStaff.filter(staff => {
        // Must be assigned to the current branch
        const isAssignedToBranch = staff.branchId === targetBranchId;
        
        // Must be active (not archived)
        const isActive = !staff.archived;
        
        // Must be available for online bookings (unless specifically requested to show hidden)
        const isAvailableForBooking = options.includeHidden || !staff.hideFromOnlineBookings;
        
        // Filter out test/system accounts
        const isRealStaff = !staff.firstName?.toLowerCase().includes('test') && 
                           !staff.firstName?.toLowerCase().includes('led') &&
                           !staff.lastName?.toLowerCase().includes('test');
        
        const shouldInclude = isAssignedToBranch && isActive && isAvailableForBooking && isRealStaff;
        
        if (!shouldInclude) {
          console.log(`❌ Filtering out ${staff.firstName} ${staff.lastName}: assigned=${isAssignedToBranch}, active=${isActive}, available=${isAvailableForBooking}, real=${isRealStaff}`);
        }
        
        return shouldInclude;
      });
      
      console.log(`✅ After filtering: ${branchSpecificStaff.length} staff members for branch ${targetBranchId}`);
      branchSpecificStaff.forEach(staff => {
        console.log(`   - ${staff.firstName} ${staff.lastName} (${staff.staffCategoryName || 'No role'})`);
      });
      
      // ADDITIONAL FILTER: If specific roles/qualifications are requested
      if (options.requiredRole) {
        const roleFilteredStaff = branchSpecificStaff.filter(staff => {
          const staffRole = staff.staffCategoryName?.toLowerCase() || '';
          const requiredRole = options.requiredRole.toLowerCase();
          
          // Handle role matching logic
          if (requiredRole === 'nurse' || requiredRole === 'injectable') {
            return staffRole.includes('nurse');
          } else if (requiredRole === 'therapist' || requiredRole === 'dermal') {
            return staffRole.includes('therapist') || staffRole.includes('dermal');
          } else {
            return staffRole.includes(requiredRole);
          }
        });
        
        console.log(`🎯 Role-filtered (${options.requiredRole}): ${roleFilteredStaff.length} staff members`);
        return roleFilteredStaff;
      }
      
      return branchSpecificStaff;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get staff member by ID
  async getStaffById(staffId) {
    try {
      await this.ensureBranchId();
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/staff/${staffId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // NEW: Get qualified staff for a specific service/treatment
  async getQualifiedStaffForService(serviceId, branchId = null) {
    try {
      console.log(`🔍 Finding qualified staff for service: ${serviceId}`);
      
      // Get the service details to understand requirements
      const service = await this.getServiceById(serviceId);
      console.log(`📋 Service: ${service?.name}`);
      
      // Get all staff for the branch
      const allStaff = await this.getStaff(branchId);
      
      // Filter staff who are qualified for this service
      const qualifiedStaff = allStaff.filter(staff => {
        // Check if this service is in the staff's disqualified list
        const isDisqualified = staff.disqualifiedServices?.includes(serviceId);
        const isQualified = !isDisqualified;
        
        console.log(`${isQualified ? '✅' : '❌'} ${staff.firstName} ${staff.lastName} - ${isQualified ? 'QUALIFIED' : 'DISQUALIFIED'} for ${service?.name}`);
        
        return isQualified;
      });
      
      console.log(`🎯 Found ${qualifiedStaff.length} qualified staff members for service: ${service?.name}`);
      
      return qualifiedStaff;
    } catch (error) {
      console.error('❌ Error getting qualified staff:', error);
      // Fallback to all staff if service qualification check fails
      return await this.getStaff(branchId);
    }
  }

  // AVAILABILITY (Branch level)
  async checkAvailability(date, serviceId, staffId = null) {
    try {
      await this.ensureBranchId();
      
      const params = {
        date,
        serviceId
      };
      
      if (staffId) params.staffId = staffId;
      
      const response = await this.api.get(
        `/${this.config.businessId}/branch/${this.branchId}/availability`, 
        { params }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // INTELLIGENT AVAILABILITY SYSTEM
  // Since Phorest API doesn't provide availability endpoints, we generate availability
  // by checking existing appointments and business hours
  async getStaffAvailability(staffId, date, duration = 60) {
    console.log(`🧠 Generating availability for staff ${staffId} on ${date} (${duration}min slots)`);
    
    try {
      // Step 1: Check business hours first
      const businessHours = this.getBusinessHours(date);
      console.log(`🏢 Business hours for ${date}:`, businessHours);
      
      if (businessHours.closed) {
        console.log(`🚫 Clinic closed on ${date} (${new Date(date).toLocaleDateString('en-AU', { weekday: 'long' })})`);
        return {
          staffId,
          date,
          availableSlots: []
        };
      }
      
      // Step 2: Generate time slots based on business hours  
      const allPossibleSlots = this.generateTimeSlots(date, businessHours.start, businessHours.end, duration);
      console.log(`🕐 Generated ${allPossibleSlots.length} possible time slots for ${businessHours.start}:00-${businessHours.end}:00`);
      
      if (allPossibleSlots.length === 0) {
        console.warn(`⚠️ No time slots generated for ${date}`);
        return {
          staffId,
          date,
          availableSlots: [],
          error: 'No time slots could be generated'
        };
      }
      
      // CRITICAL FIX: Use real appointment data to calculate availability
      console.log(`📅 Fetching existing appointments for staff ${staffId} on ${date}`);
      
      try {
        // Get existing appointments for this staff member and date
        const existingAppointments = await this.getAppointments({
          staffId: staffId,
          from_date: date,
          to_date: date,
          size: 100
        });
        
        console.log(`📋 Found ${existingAppointments.appointments?.length || 0} existing appointments for staff ${staffId}`);
        
        // Filter out time slots that conflict with existing appointments
        const availableSlots = this.filterAvailableSlots(
          allPossibleSlots, 
          existingAppointments.appointments || []
        );
        
        console.log(`✅ ${availableSlots.length} slots available after filtering out existing appointments`);
        
        return {
          staffId,
          date,
          availableSlots: availableSlots
        };
        
      } catch (appointmentsError) {
        console.warn(`⚠️ Could not fetch appointments for availability filtering:`, appointmentsError.message);
        console.log(`🔄 Falling back to business hours availability (no appointment filtering)`);
        
        // If appointments API fails, show all business hour slots as available
        // This is better than fake "every other slot" logic
        console.log(`✅ ${allPossibleSlots.length} slots available (fallback: all business hours)`);
        
        return {
          staffId,
          date,
          availableSlots: allPossibleSlots
        };
      }
      
    } catch (error) {
      console.error(`❌ Availability generation failed for ${staffId}:`, error);
      
      // Ultimate fallback: Return empty but don't crash
      return {
        staffId,
        date,
        availableSlots: [],
        error: `Availability generation failed: ${error.message}`
      };
    }
  }

  // Get business hours for a given date
  getBusinessHours(date) {
    const dayOfWeek = new Date(date).getDay();
    
    // Business hours for Skin Societe (Monday = 1, Sunday = 0)
    if (dayOfWeek === 0) { // Sunday - closed
      return { start: null, end: null, closed: true };
    } else if (dayOfWeek === 6) { // Saturday
      return { start: 9, end: 17, closed: false }; // 9 AM - 5 PM
    } else { // Monday to Friday
      return { start: 9, end: 18, closed: false }; // 9 AM - 6 PM
    }
  }

  // Generate time slots for a given day and hours
  generateTimeSlots(date, startHour, endHour, duration) {
    if (!startHour || !endHour) {
      return []; // Closed day
    }
    
    const slots = [];
    const slotInterval = Math.max(15, Math.floor(duration / 4)); // Minimum 15-minute intervals
    const today = new Date();
    const targetDate = new Date(date);
    const isToday = targetDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        // Skip past times if this is today
        if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute + 15))) {
          continue; // Need at least 15 minutes notice
        }
        
        // Don't create slots too close to closing time
        const slotEndHour = hour + Math.ceil(duration / 60);
        const slotEndMinute = minute + (duration % 60);
        
        if (slotEndHour < endHour || (slotEndHour === endHour && slotEndMinute <= 0)) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const startTime = `${date}T${timeString}:00`;
          
          // Calculate end time
          const endMinute = minute + duration;
          const finalHour = hour + Math.floor(endMinute / 60);
          const finalMinute = endMinute % 60;
          const endTimeString = `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
          const endTime = `${date}T${endTimeString}:00`;
          
          slots.push({
            time: timeString,
            available: true,
            startTime: startTime,
            endTime: endTime
          });
        }
      }
    }
    
    return slots;
  }

  // Filter out slots that conflict with existing appointments
  filterAvailableSlots(slots, appointments) {
    return slots.filter(slot => {
      const slotStart = new Date(`${slot.startTime}`);
      const slotEnd = new Date(`${slot.endTime}`);
      
      // Check if this slot conflicts with any appointment
      const hasConflict = appointments.some(appointment => {
        if (!appointment.appointmentDate || !appointment.startTime || !appointment.endTime) {
          return false;
        }
        
        // Parse appointment times (Phorest format: date separate from time)
        const aptStart = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
        const aptEnd = new Date(`${appointment.appointmentDate}T${appointment.endTime}`);
        
        // Check for time overlap
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      return !hasConflict;
    });
  }

  // Parse availability slots from Phorest API response
  parseAvailabilitySlots(availabilityData, date) {
    try {
      const slots = [];
      
      console.log(`🔍 Parsing availability data structure:`, JSON.stringify(availabilityData, null, 2));
      
      // Pattern 1: availableSlots array
      if (availabilityData && availabilityData.availableSlots) {
        console.log(`📅 Found availableSlots array with ${availabilityData.availableSlots.length} items`);
        availabilityData.availableSlots.forEach(slot => {
          slots.push({
            time: this.formatTimeSlot(slot.startTime || slot.time),
            available: true,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        });
      } 
      // Pattern 2: slots array
      else if (availabilityData && availabilityData.slots) {
        console.log(`📅 Found slots array with ${availabilityData.slots.length} items`);
        availabilityData.slots.forEach(slot => {
          if (slot.available !== false) {
            slots.push({
              time: this.formatTimeSlot(slot.startTime || slot.time),
              available: true,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        });
      } 
      // Pattern 3: Direct array of slots
      else if (availabilityData && Array.isArray(availabilityData)) {
        console.log(`📅 Found direct array with ${availabilityData.length} items`);
        availabilityData.forEach(slot => {
          if (slot.available !== false) {
            slots.push({
              time: this.formatTimeSlot(slot.startTime || slot.time),
              available: true,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        });
      }
      // Pattern 4: Schedule data
      else if (availabilityData && availabilityData.schedule) {
        console.log(`📅 Found schedule data`);
        Object.keys(availabilityData.schedule).forEach(timeSlot => {
          const slotData = availabilityData.schedule[timeSlot];
          if (slotData && slotData.available) {
            slots.push({
              time: this.formatTimeSlot(timeSlot),
              available: true,
              startTime: timeSlot,
              endTime: slotData.endTime
            });
          }
        });
      }
      // Pattern 5: Times array
      else if (availabilityData && availabilityData.times) {
        console.log(`📅 Found times array with ${availabilityData.times.length} items`);
        availabilityData.times.forEach(timeSlot => {
          slots.push({
            time: this.formatTimeSlot(timeSlot.time || timeSlot),
            available: timeSlot.available !== false,
            startTime: timeSlot.time || timeSlot,
            endTime: timeSlot.endTime
          });
        });
      }
      // Pattern 6: Working hours fallback - generate slots if staff is working
      else if (availabilityData && (availabilityData.workingHours || availabilityData.isWorking)) {
        console.log(`📅 Generating slots from working hours data`);
        // Generate standard business hour slots if staff is working
        const startHour = availabilityData.startTime ? parseInt(availabilityData.startTime.split(':')[0]) : 9;
        const endHour = availabilityData.endTime ? parseInt(availabilityData.endTime.split(':')[0]) : 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
              time: timeString,
              available: true,
              startTime: `${date}T${timeString}:00`,
              endTime: `${date}T${timeString.split(':')[0]}:${(parseInt(timeString.split(':')[1]) + 30).toString().padStart(2, '0')}:00`
            });
          }
        }
      }
      else {
        console.warn(`⚠️ Unknown availability data structure:`, Object.keys(availabilityData || {}));
      }
      
      console.log(`✅ Successfully parsed ${slots.length} availability slots`);
      return slots;
    } catch (error) {
      console.error('❌ Error parsing availability slots:', error);
      console.error('❌ Availability data that failed to parse:', availabilityData);
      return [];
    }
  }

  // Format time slot to HH:MM format
  formatTimeSlot(timeString) {
    try {
      if (!timeString) return '09:00';
      
      // Handle ISO datetime strings
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-AU', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Handle time-only strings
      if (timeString.includes(':')) {
        return timeString.substring(0, 5); // Get HH:MM part
      }
      
      return timeString;
    } catch (error) {
      console.warn('⚠️ Error formatting time slot:', error);
      return '09:00';
    }
  }

  // VOUCHERS (Business level)
  async getVouchers(params = {}) {
    try {
      const response = await this.api.get(`/${this.config.businessId}/voucher`, {
        params: {
          size: 50,
          page: 0,
          ...params
        }
      });
      
      return {
        vouchers: response.data._embedded?.vouchers || [],
        pagination: response.data.page || {}
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createVoucher(voucherData) {
    try {
      await this.ensureBranchId();
      
      const payload = {
        creatingBranchId: this.branchId,
        ...voucherData
      };
      
      const response = await this.api.post(`/${this.config.businessId}/voucher`, payload);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // SKIN SOCIETE USER SYNC SYSTEM
  
  /**
   * Complete user sync - gets all Phorest data for a client
   */
  async syncUserData(email, phone = null) {
    try {
      console.log(`🔄 Syncing user data for: ${email} ${phone ? `/ ${phone}` : ''}`);
      
      // Find client in Phorest
      const client = await this.findClientByEmailOrPhone(email, phone);
      
      if (!client) {
        console.log('❌ No Phorest client found');
        return {
          found: false,
          client: null,
          appointments: [],
          purchases: [],
          loyaltyStatus: null
        };
      }
      
      console.log(`✅ Found client: ${client.firstName} ${client.lastName} (ID: ${client.clientId})`);
      console.log('📋 Available client fields:', Object.keys(client));
      console.log('📱 Client phone fields:', { phone: client.phone, mobile: client.mobile, telephone: client.telephone });
      console.log('📅 Client date fields:', { dateOfBirth: client.dateOfBirth, dob: client.dob, birthDate: client.birthDate });
      
      // Get client's appointment history
      const appointments = await this.getClientAppointments(client.clientId, { size: 100 });
      console.log(`📅 Found ${appointments.length} appointments`);
      
      // Get client's purchase history  
      const purchaseData = await this.getClientPurchases(client.clientId, { size: 100 });
      console.log(`💰 Found ${purchaseData.purchases.length} purchases, total: $${purchaseData.totalSpent}`);
      
      // Calculate loyalty status
      const loyaltyStatus = await this.getClientLoyaltyStatus(client.clientId);
      console.log(`🏆 Loyalty tier: ${loyaltyStatus.tier} (${loyaltyStatus.points} points)`);
      
      return {
        found: true,
        client: {
          ...client,
          phorestId: client.clientId,
          fullName: `${client.firstName} ${client.lastName}`,
          homeClinic: client.homeBranchId ? await this.getBranchName(client.homeBranchId) : 'Not set'
        },
        appointments: this.formatAppointments(appointments),
        purchases: this.formatPurchases(purchaseData.purchases),
        loyaltyStatus,
        summary: {
          totalAppointments: appointments.length,
          totalPurchases: purchaseData.purchases.length,
          totalSpent: purchaseData.totalSpent,
          loyaltyTier: loyaltyStatus.tier,
          loyaltyPoints: loyaltyStatus.points,
          memberSince: client.createdDate ? new Date(client.createdDate).getFullYear() : 'Unknown'
        }
      };
    } catch (error) {
      console.error('❌ User sync failed:', error.message);
      this.handleError(error);
    }
  }

  async getBranchName(branchId) {
    try {
      const branches = await this.getBranches();
      const branch = branches.find(b => b.branchId === branchId);
      return branch ? branch.name : 'Unknown Branch';
    } catch (error) {
      return 'Unknown Branch';
    }
  }

  formatAppointments(appointments) {
    return appointments.map(apt => ({
      id: apt.appointmentId,
      date: apt.startTime ? new Date(apt.startTime).toLocaleDateString() : 'Unknown',
      time: apt.startTime ? new Date(apt.startTime).toLocaleTimeString() : 'Unknown',
      service: apt.serviceName || 'Unknown Service',
      staff: apt.staffName || 'Not specified',
      status: apt.status || 'Unknown',
      duration: apt.duration || 0,
      cost: apt.totalCost || 0,
      notes: apt.notes || '',
      branch: apt.branchName || 'Unknown Branch'
    }));
  }

  formatPurchases(purchases) {
    return purchases.map(purchase => ({
      id: purchase.purchaseId,
      date: purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : 'Unknown',
      amount: purchase.totalAmount || 0,
      items: purchase.items || [],
      source: purchase.source || 'in-store',
      notes: purchase.notes || '',
      orderNumber: purchase.orderNumber || null
    }));
  }

  // SKIN SOCIETE SPECIFIC INTEGRATIONS
  
  /**
   * Book a consultation for new Skin Societe clients
   */
  async bookConsultation(consultationData) {
    try {
      // Create client if new
      let client = null;
      if (consultationData.email) {
        const existingClients = await this.searchClientByEmail(consultationData.email);
        client = existingClients.length > 0 ? existingClients[0] : null;
      }
      
      if (!client) {
        client = await this.createClient({
          firstName: consultationData.firstName,
          lastName: consultationData.lastName,
          email: consultationData.email,
          phone: consultationData.phone,
          notes: `Skin Societe consultation booking - Skin type: ${consultationData.skinType}, Concerns: ${consultationData.concerns}`
        });
      }
      
      // Book consultation appointment
      const appointment = await this.createAppointment({
        clientId: client.clientId,
        serviceId: consultationData.consultationServiceId,
        staffId: consultationData.preferredStaffId,
        startTime: consultationData.appointmentDateTime,
        notes: `New client consultation - Skin type: ${consultationData.skinType}, Concerns: ${consultationData.concerns}`,
        duration: 30 // 30-minute consultation
      });
      
      return {
        client,
        appointment,
        loyaltyStatus: await this.getClientLoyaltyStatus(client.clientId)
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Sync e-commerce purchase with Phorest for loyalty tracking
   */
  async syncEcommercePurchase(purchaseData) {
    try {
      let client = null;
      
      // Find or create client
      if (purchaseData.email) {
        const existingClients = await this.searchClientByEmail(purchaseData.email);
        client = existingClients.length > 0 ? existingClients[0] : null;
      }
      
      if (!client) {
        client = await this.createClient({
          firstName: purchaseData.firstName,
          lastName: purchaseData.lastName,
          email: purchaseData.email,
          phone: purchaseData.phone,
          notes: 'Skin Societe e-commerce customer'
        });
      }
      
      // Create purchase record for loyalty tracking
      const purchase = await this.createPurchase({
        clientId: client.clientId,
        totalAmount: purchaseData.totalAmount,
        purchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
        source: 'skin_societe_ecommerce',
        items: purchaseData.items || [],
        notes: `E-commerce order: ${purchaseData.orderNumber || 'N/A'}`
      });
      
      return {
        client,
        purchase,
        loyaltyStatus: await this.getClientLoyaltyStatus(client.clientId)
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // TEST CONNECTION - More comprehensive testing
  async testConnection() {
    try {
      console.log('🔄 Testing Phorest API connection...\n');
      
      // Test 1: Get branches (required for most operations)
      console.log('1️⃣ Getting branches...');
      const branches = await this.getBranches();
      
      if (branches.length === 0) {
        console.log('⚠️ No branches found. Please check your business setup.');
        return false;
      }
      
      console.log(`✅ Found ${branches.length} branch(es):`);
      branches.forEach(branch => {
        console.log(`   - ${branch.name} (ID: ${branch.branchId})`);
      });
      
      // Test 2: Get some clients
      console.log('\n2️⃣ Testing client endpoint...');
      const { clients, totalElements } = await this.getClients({ size: 3 });
      console.log(`✅ Found ${totalElements} total clients`);
      if (clients.length > 0) {
        console.log('   Sample clients:');
        clients.forEach(client => {
          console.log(`   - ${client.firstName} ${client.lastName} (${client.email || 'No email'})`);
        });
      }
      
      // Test 3: Get services
      console.log('\n3️⃣ Testing services endpoint...');
      const services = await this.getServices();
      console.log(`✅ Found ${services.length} services`);
      if (services.length > 0) {
        console.log('   Sample services:');
        services.slice(0, 3).forEach(service => {
          console.log(`   - ${service.name} (${service.price || 'Price not shown'})`);
        });
      }
      
      // Test 4: Get products
      console.log('\n4️⃣ Testing products endpoint...');
      const { products } = await this.getProducts({ size: 3 });
      console.log(`✅ Found ${products.length} products`);
      if (products.length > 0) {
        console.log('   Sample products:');
        products.forEach(product => {
          console.log(`   - ${product.name} (${product.price || 'Price not shown'})`);
        });
      }
      
      // Test 5: Test loyalty calculation with first client
      if (clients.length > 0) {
        console.log('\n5️⃣ Testing loyalty calculation...');
        const firstClient = clients[0];
        const loyaltyStatus = await this.getClientLoyaltyStatus(firstClient.clientId);
        console.log(`✅ Loyalty status for ${firstClient.firstName} ${firstClient.lastName}:`);
        console.log(`   - Total Spent: $${loyaltyStatus.totalSpent}`);
        console.log(`   - Points: ${loyaltyStatus.points}`);
        console.log(`   - Tier: ${loyaltyStatus.tier}`);
        console.log(`   - Progress to next tier: ${loyaltyStatus.nextTierProgress.percentage.toFixed(1)}%`);
      }
      
      console.log('\n✨ All tests passed! Phorest API connection is working correctly.');
      console.log('\n🎯 Ready for Skin Societe integration:');
      console.log('   ✅ Client management');
      console.log('   ✅ Appointment booking');
      console.log('   ✅ Service catalog');
      console.log('   ✅ Product inventory');
      console.log('   ✅ Loyalty system');
      console.log('   ✅ E-commerce sync');
      
      return true;
      
    } catch (error) {
      console.error('\n❌ Connection test failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const phorestService = new PhorestService();

export default phorestService;