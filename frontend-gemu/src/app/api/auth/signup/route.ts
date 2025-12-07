import { NextResponse } from "next/server";

const GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
if (!GATEWAY_BASE_URL) {
  throw new Error("La variable NEXT_PUBLIC_API_URL no está definida");
}

// En Railway: NEXT_PUBLIC_API_URL = https://...railway.app (sin /api)
// En Docker: NEXT_PUBLIC_API_URL = http://gateway:8080/api (con /api)
const needsApiPrefix = !GATEWAY_BASE_URL.endsWith("/api");

async function apiFetch(path: string, options: RequestInit) {
  // Si la URL no termina en /api, el path no debe empezar con /api
  let finalPath = path;
  if (!needsApiPrefix && path.startsWith("/api")) {
    finalPath = path.replace("/api", "");
  }

  const url = `${GATEWAY_BASE_URL}${finalPath}`;
  console.log("🔵 [API FETCH] Llamando a:", url);

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    console.error(
      "🔴 [API FETCH] Error del Gateway:",
      error,
      "Status:",
      response.status
    );
    throw { status: response.status, message: error };
  }
  return response.json();
}
// === SIGNUP ===
export async function POST(request: Request) {
  try {
    const {
      nombre,
      apellidos,
      correoElectronico,
      username,
      password,
      telefono,
      direccion,
    } = await request.json();

    if (!correoElectronico || !password) {
      return NextResponse.json(
        { message: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const data = await apiFetch("/api/usuarios/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellidos,
        correoElectronico,
        username,
        password,
        telefono,
        direccion,
      }),
    });

    console.log("✅ [SIGNUP] Usuario creado exitosamente");
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error al registrar el usuario", error: err.message || err },
      { status: err.status || 500 }
    );
  }
}

// === UPDATE ===
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { message: "El ID del usuario es obligatorio" },
        { status: 400 }
      );
    }

    const data = await apiFetch("/api/usuarios/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error al actualizar el usuario", error: err.message || err },
      { status: err.status || 500 }
    );
  }
}

// === DELETE ===
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "El ID del usuario es obligatorio" },
        { status: 400 }
      );
    }

    const data = await apiFetch(`/api/usuarios/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json(
      { message: "Usuario eliminado correctamente", data },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error al eliminar el usuario", error: err.message || err },
      { status: err.status || 500 }
    );
  }
}
