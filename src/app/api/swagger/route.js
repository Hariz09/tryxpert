// app/api/swagger/route.js
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'api-docs', 'swagger.yaml');
  const yamlContent = readFileSync(filePath, 'utf8');
  const swaggerDoc = yaml.load(yamlContent);
  
  return NextResponse.json(swaggerDoc);
}