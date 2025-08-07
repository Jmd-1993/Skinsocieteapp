import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Debug booking endpoint called');
    const body = await request.json();
    
    console.log('📝 Request body:', body);

    // Step 1: Test dynamic import
    try {
      console.log('🔄 Testing dynamic import...');
      const { default: phorestService } = await import('@/app/services/phorestService');
      console.log('✅ Dynamic import successful');
      
      // Step 2: Test Phorest service initialization
      console.log('🔄 Testing Phorest service config...');
      console.log('📊 Config:', {
        baseURL: phorestService.config?.baseURL,
        businessId: phorestService.config?.businessId,
        username: phorestService.config?.auth?.username
      });
      
      // Step 3: Test simple API call
      console.log('🔄 Testing Phorest API connection...');
      const branches = await phorestService.getBranches();
      console.log(`✅ Phorest API working: ${branches.length} branches found`);
      
      return NextResponse.json({
        success: true,
        debug: {
          importWorking: true,
          configLoaded: true,
          apiConnected: true,
          branchCount: branches.length,
          requestBody: body
        }
      });
      
    } catch (phorestError) {
      console.error('❌ Phorest service error:', phorestError);
      return NextResponse.json({
        success: false,
        error: 'Phorest service error',
        debug: {
          importWorking: true,
          phorestError: phorestError.message,
          stack: phorestError.stack
        }
      }, { status: 500 });
    }
    
  } catch (importError) {
    console.error('❌ Import error:', importError);
    return NextResponse.json({
      success: false,
      error: 'Import error',
      debug: {
        importWorking: false,
        importError: importError.message,
        stack: importError.stack
      }
    }, { status: 500 });
  }
}