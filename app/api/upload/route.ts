import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Initialize OpenAI client inside the request handler
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing OpenAI API key' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    return NextResponse.json({
      fileId: uploadedFile.id,
      filename: file.name,
    });

  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
