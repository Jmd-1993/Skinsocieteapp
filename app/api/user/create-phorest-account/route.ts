import { NextRequest, NextResponse } from 'next/server';

interface CreateAccountData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  homeClinicId?: string;
  skinType?: string;
  skinConcerns?: string[];
  allergies?: string;
  marketingConsent?: boolean;
  smsConsent?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateAccountData = await request.json();

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'First name, last name, and email are required' 
        },
        { status: 400 }
      );
    }

    // Import Phorest service (dynamic import for server-side)
    const { default: phorestService } = await import('../../../services/phorestService.js');

    // Check if user already exists
    console.log(`🔍 Checking if user already exists: ${data.email}`);
    const existingClients = await phorestService.searchClientByEmail(data.email);
    
    if (existingClients.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Account already exists',
        message: 'A Phorest account already exists with this email address.',
        existingClient: {
          name: `${existingClients[0].firstName} ${existingClients[0].lastName}`,
          email: existingClients[0].email,
          clientId: existingClients[0].clientId
        }
      });
    }

    // Prepare client data for Phorest
    const clientData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.phone?.replace(/[^\d+]/g, ''), // Clean phone number
      dateOfBirth: data.dateOfBirth,
      homeBranchId: data.homeClinicId,
      emailMarketingConsent: data.marketingConsent ?? true,
      smsMarketingConsent: data.smsConsent ?? true,
      emailReminderConsent: true,
      smsReminderConsent: true,
      notes: [
        'New Skin Societé app user',
        data.skinType ? `Skin type: ${data.skinType}` : '',
        data.skinConcerns?.length ? `Concerns: ${data.skinConcerns.join(', ')}` : '',
        data.allergies ? `Allergies: ${data.allergies}` : ''
      ].filter(Boolean).join(' | ')
    };

    console.log(`✨ Creating new Phorest account for: ${data.firstName} ${data.lastName}`);
    
    // Create client in Phorest
    const newClient = await phorestService.createClient(clientData);
    
    console.log(`✅ Successfully created Phorest account: ${newClient.clientId}`);

    // Get the client's loyalty status
    const loyaltyStatus = await phorestService.getClientLoyaltyStatus(newClient.clientId);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      client: {
        clientId: newClient.clientId,
        fullName: `${newClient.firstName} ${newClient.lastName}`,
        email: newClient.email,
        phone: newClient.mobile,
        homeClinic: data.homeClinicId || 'Not set',
        loyaltyStatus,
        isNewUser: true
      }
    });

  } catch (error) {
    console.error('Account creation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create account',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}