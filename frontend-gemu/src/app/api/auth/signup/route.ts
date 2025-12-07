import { NextResponse } from "next/server";

const GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
if (!GATEWAY_BASE_URL) {
  throw new Error("La variable NEXT_PUBLIC_API_URL no está definida");
}

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

    console.log("🔵 [SIGNUP] Gateway URL:", GATEWAY_BASE_URL);
    console.log(
      "🔵 [SIGNUP] Llamando a:",
      `${GATEWAY_BASE_URL}/usuarios/crear`
    );

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

    const response = await fetch(`${GATEWAY_BASE_URL}/usuarios/crear`, {
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

    console.log(
      "🟢 [SIGNUP] Status de respuesta del Gateway:",
      response.status
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("🔴 [SIGNUP] Error del Gateway:", error);
      console.error("🔴 [SIGNUP] Status:", response.status);
      return NextResponse.json(
        { message: "Error al registrar el usuario", error },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ [SIGNUP] Usuario creado exitosamente");
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("🔴 [SIGNUP] Error durante el registro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { message: "El ID del usuario es obligatorio" },
        { status: 400 }
      );
    }

    console.log(
      "🔵 [UPDATE] Llamando a:",
      `${GATEWAY_BASE_URL}/usuarios/actualizar`
    );

    const response = await fetch(`${GATEWAY_BASE_URL}/usuarios/actualizar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("🟢 [UPDATE] Status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("🔴 [UPDATE] Error:", error);
      return NextResponse.json(
        { message: "Error al actualizar el usuario", error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("🔴 [UPDATE] Error actualizando usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "El ID del usuario es obligatorio" },
        { status: 400 }
      );
    }

    console.log(
      "🔵 [DELETE] Llamando a:",
      `${GATEWAY_BASE_URL}/usuarios/${id}`
    );

    const response = await fetch(`${GATEWAY_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });

    console.log("🟢 [DELETE] Status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("🔴 [DELETE] Error:", error);
      return NextResponse.json(
        { message: "Error al eliminar el usuario", error },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 [DELETE] Error eliminando usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
