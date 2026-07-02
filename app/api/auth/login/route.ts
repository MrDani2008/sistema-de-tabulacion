import { NextRequest } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usuario, contrasena } = body;

    if (!usuario || !contrasena) {
      return errorResponse('Usuario y contraseña son obligatorios', 400);
    }

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminUser || !adminPass) {
      return errorResponse('Variables ADMIN_USER y ADMIN_PASS no configuradas', 500);
    }

    if (usuario !== adminUser || contrasena !== adminPass) {
      return errorResponse('Credenciales inválidas', 401);
    }

    const token = await createSessionToken(usuario);
    const cookieHeaders = await setSessionCookie(token);

    const response = jsonResponse({ success: true, usuario });
    cookieHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al iniciar sesión');
  }
}
