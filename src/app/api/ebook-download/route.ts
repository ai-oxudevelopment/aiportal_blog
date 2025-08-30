import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация данных
    const { firstName, lastName, workEmail, companyName, jobTitle } = body;

    if (!workEmail) {
      return NextResponse.json(
        { error: "Work email is required" },
        { status: 400 }
      );
    }

    // Здесь можно добавить логику для:
    // - Сохранения данных в базу данных
    // - Отправки email с ссылкой на скачивание
    // - Интеграции с CRM системой
    // - Логирования для аналитики

    console.log("Ebook download request:", {
      firstName,
      lastName,
      workEmail,
      companyName,
      jobTitle,
      timestamp: new Date().toISOString()
    });

    // Имитация обработки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Возвращаем успешный ответ
    return NextResponse.json(
      {
        success: true,
        message: "Form submitted successfully",
        downloadUrl: "/downloads/ebook.pdf" // Ссылка на файл для скачивания
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing ebook download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}