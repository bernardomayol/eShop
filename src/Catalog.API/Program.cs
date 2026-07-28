var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddApplicationServices();
builder.Services.AddProblemDetails();

// 1. Añadir la política de CORS para permitir que tu app de React se conecte
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var withApiVersioning = builder.Services.AddApiVersioning(options =>
{
    // Include "api-supported-versions" and "api-deprecated-versions" headers in all responses
    options.ReportApiVersions = true;
});

builder.AddDefaultOpenApi(withApiVersioning);

var app = builder.Build();

// 2. ACTIVAR EL MIDDLEWARE DE CORS (Debe ir antes de app.MapCatalogApi)
app.UseCors("AllowReactApp");

app.MapDefaultEndpoints();
app.UseStatusCodePages();
app.MapCatalogApi();
app.UseDefaultOpenApi();

foreach (var service in builder.Services)
{
    Console.WriteLine($"Servicio: {service.ServiceType.FullName} - Lifetime: {service.Lifetime}");
}

app.Run();
