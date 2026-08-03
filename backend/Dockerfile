# ==========================================================================
#  Dockerfile multi-stage da API (.NET 8)
#  Contexto de build esperado: ./backend
# ==========================================================================

# ---- Stage 1: build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copia os .csproj primeiro para aproveitar o cache de restore
COPY src/GestaoColaboradores.Domain/*.csproj          src/GestaoColaboradores.Domain/
COPY src/GestaoColaboradores.Infrastructure/*.csproj  src/GestaoColaboradores.Infrastructure/
COPY src/GestaoColaboradores.Application/*.csproj      src/GestaoColaboradores.Application/
COPY src/GestaoColaboradores.Api/*.csproj              src/GestaoColaboradores.Api/
RUN dotnet restore src/GestaoColaboradores.Api/GestaoColaboradores.Api.csproj

# Copia o restante do código e publica
COPY src/ src/
RUN dotnet publish src/GestaoColaboradores.Api/GestaoColaboradores.Api.csproj \
    -c Release -o /app /p:UseAppHost=false

# ---- Stage 2: runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# A API escuta na 8080 dentro do container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "GestaoColaboradores.Api.dll"]
