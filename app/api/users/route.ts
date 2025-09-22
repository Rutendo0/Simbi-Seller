import { NextResponse } from 'next/server';
import { userOperations, testDatabaseConnection } from '@/lib/database';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  const test = url.searchParams.get('test');

  try {
    // Health check endpoint
    if (test === '1') {
      const connectionTest = await testDatabaseConnection();
      return NextResponse.json({
        database: connectionTest.success ? 'connected' : 'disconnected',
        message: connectionTest.message,
        timestamp: new Date().toISOString()
      });
    }

    // Test database connection first
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: connectionTest.message,
        fallback: 'Using localStorage mode'
      }, { status: 503 });
    }

    if (uid) {
      const user = await userOperations.getUser(uid);
      if (user) {
        return NextResponse.json({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.display_name,
            storeName: user.store_name,
            phoneNumber: user.phone_number,
            nationalId: user.national_id,
            businessOwnerName: user.business_owner_name,
            businessOwnerEmail: user.business_owner_email,
            businessOwnerPhone: user.business_owner_phone,
            storeCountry: user.store_country,
            storeCity: user.store_city,
            storeAddress1: user.store_address1,
            storeAddress2: user.store_address2,
            postalCode: user.postal_code,
            vatNumber: user.vat_number,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }
        });
      } else {
        return NextResponse.json({
          user: null,
          message: 'User not found in database'
        });
      }
    }

    // Return empty array if no uid specified
    return NextResponse.json({ users: [] });
  } catch (error: any) {
    console.error('Database query error:', error);
    return NextResponse.json({
      error: 'Database query failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.uid || !body.email) {
      return NextResponse.json({
        error: 'Missing required fields: uid and email'
      }, { status: 400 });
    }

    // Test database connection first
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: connectionTest.message,
        fallback: 'Please use localStorage mode for now'
      }, { status: 503 });
    }

    // Create or update user in database
    const user = await userOperations.createOrUpdateUser({
      uid: body.uid,
      email: body.email,
      displayName: body.displayName,
      storeName: body.storeName,
      phoneNumber: body.phoneNumber,
      nationalId: body.nationalId,
      businessOwnerName: body.businessOwnerName,
      businessOwnerEmail: body.businessOwnerEmail,
      businessOwnerPhone: body.businessOwnerPhone,
      storeCountry: body.storeCountry,
      storeCity: body.storeCity,
      storeAddress1: body.storeAddress1,
      storeAddress2: body.storeAddress2,
      postalCode: body.postalCode,
      vatNumber: body.vatNumber,
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name,
        storeName: user.store_name,
        phoneNumber: user.phone_number,
        nationalId: user.national_id,
        businessOwnerName: user.business_owner_name,
        businessOwnerEmail: user.business_owner_email,
        businessOwnerPhone: user.business_owner_phone,
        storeCountry: user.store_country,
        storeCity: user.store_city,
        storeAddress1: user.store_address1,
        storeAddress2: user.store_address2,
        postalCode: user.postal_code,
        vatNumber: user.vat_number,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error: any) {
    console.error('Database operation error:', error);
    return NextResponse.json({
      error: 'Database operation failed',
      details: error.message
    }, { status: 500 });
  }
}
