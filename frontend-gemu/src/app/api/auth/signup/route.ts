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

    if (!response.ok) {
      const error = await response.text();
      console.error("Error en la respuesta del gateway:", error);
      return NextResponse.json(
        { message: "Error al registrar el usuario", error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error durante el registro:", error);
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

    const response = await fetch(`${GATEWAY_BASE_URL}/usuarios/actualizar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { message: "Error al actualizar el usuario", error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
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

    const response = await fetch(`${GATEWAY_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
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
    console.error("Error eliminando usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
