import { NextRequest, NextResponse } from 'next/server';

interface AvailabilityRequest {
  date: string;
  serviceId: string;
  branchId: string;
  duration?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AvailabilityRequest = await request.json();
    const { date, serviceId, branchId, duration = 60 } = body;

    // Validate required fields
    if (!date || !serviceId || !branchId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'date, serviceId, and branchId are required'
        },
        { status: 400 }
      );
    }

    // Import Phorest service
    const { default: phorestService } = await import('@/app/services/phorestService.js');

    console.log(`🕐 Fetching availability for ${date} at branch ${branchId}`);

    try {
      // Set the branch context for all Phorest operations
      console.log(`🏥 Setting branch context to: ${branchId}`);
      phorestService.branchId = branchId;
      
      // Get staff members for the branch
      const staff = await phorestService.getStaff(branchId);
      console.log(`👥 Found ${staff.length} staff members for branch ${branchId}`);
      console.log(`👥 Staff details:`, staff.map(s => ({ 
        id: s.staffId, 
        name: `${s.firstName} ${s.lastName}`, 
        title: s.title || s.jobTitle 
      })));

      if (staff.length === 0) {
        console.warn(`⚠️ No staff found for branch ${branchId}`);
        throw new Error('No staff members found for this branch');
      }

      // Get availability for each staff member with better error handling
      const availabilityPromises = staff.map(async (staffMember: any) => {
        const staffName = `${staffMember.firstName || ''} ${staffMember.lastName || ''}`.trim();
        const staffId = staffMember.staffId;
        
        if (!staffId) {
          console.warn(`⚠️ Staff member missing ID: ${staffName}`);
          return null;
        }

        try {
          console.log(`🔍 Getting availability for ${staffName} (${staffId}) on ${date} with ${duration}min duration`);
          
          const availability = await phorestService.getStaffAvailability(
            staffId,
            date,
            duration
          );
          
          console.log(`📊 Staff ${staffName} availability result:`, {
            staffId,
            slotsCount: availability.availableSlots?.length || 0,
            error: availability.error || null
          });
          
          return {
            staffId: staffId,
            staffName: staffName || 'Unknown Staff',
            title: staffMember.jobTitle || staffMember.title || 'Beauty Therapist',
            slots: availability.availableSlots || [],
            error: availability.error || null
          };
        } catch (error) {
          console.warn(`⚠️ Could not get availability for ${staffName} (${staffId}):`, error.message);
          
          // Still return the staff member but with empty slots
          return {
            staffId: staffId,
            staffName: staffName || 'Unknown Staff',
            title: staffMember.jobTitle || staffMember.title || 'Beauty Therapist',
            slots: [],
            error: `Availability fetch failed: ${error.message}`
          };
        }
      });

      const staffAvailabilityResults = await Promise.all(availabilityPromises);
      // Filter out null results
      const staffAvailability = staffAvailabilityResults.filter(result => result !== null);
      
      // Flatten all slots and merge by time
      const allSlots: any[] = [];
      staffAvailability.forEach(staff => {
        staff.slots.forEach((slot: any) => {
          allSlots.push({
            time: slot.time,
            staffId: staff.staffId,
            staffName: staff.staffName,
            available: slot.available
          });
        });
      });

      // Sort slots by time
      allSlots.sort((a, b) => a.time.localeCompare(b.time));

      console.log(`✅ Found ${allSlots.filter(s => s.available).length} available slots`);

      return NextResponse.json({
        success: true,
        date,
        slots: allSlots,
        staff: staffAvailability
      });

    } catch (phorestError) {
      console.warn('⚠️ Phorest API error during availability fetch:', phorestError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to fetch availability from Phorest',
          message: phorestError.message || 'Phorest API connection failed',
          technicalDetails: {
            endpoint: '/api/appointments/availability',
            phorestBusinessId: process.env.PHOREST_BUSINESS_ID || 'Not set',
            branch: branchId,
            date: date
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Availability API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

function generateMockAvailability(date: string) {
  const slots = [];
  const selectedDate = new Date(date);
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();
  
  const staffMembers = [
    { id: 'X-qh_VV3E41h9tghKPiRyg', name: 'Isabelle Callaghan' },
    { id: 'staff-2', name: 'Sarah Mitchell' },
    { id: 'staff-3', name: 'Emma Thompson' }
  ];

  // Generate slots from 9 AM to 5 PM
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip past times for today
      if (isToday && hour <= currentHour) continue;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      staffMembers.forEach(staff => {
        // Random availability - 70% chance available
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          time: timeString,
          staffId: staff.id,
          staffName: staff.name,
          available: isAvailable
        });
      });
    }
  }
  
  return slots;
}