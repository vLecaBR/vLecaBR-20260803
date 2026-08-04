using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoColaboradores.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "unidades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_unidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Login = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SenhaHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "colaboradores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnidadeId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colaboradores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_colaboradores_unidades_UnidadeId",
                        column: x => x.UnidadeId,
                        principalTable: "unidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_colaboradores_usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "usuarios",
                columns: new[] { "Id", "Codigo", "DataAtualizacao", "DataCriacao", "Login", "SenhaHash", "Status" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), "MASTER", null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "master", "$2b$11$HDJE/lXB4PZaVqvoDeDnaO.nDxrUrbGCApakyfVPFmYHRPECdytZW", 1 });

            migrationBuilder.CreateIndex(
                name: "IX_colaboradores_Codigo",
                table: "colaboradores",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_colaboradores_UnidadeId",
                table: "colaboradores",
                column: "UnidadeId");

            migrationBuilder.CreateIndex(
                name: "IX_colaboradores_UsuarioId",
                table: "colaboradores",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_unidades_Codigo",
                table: "unidades",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_Codigo",
                table: "usuarios",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_Login",
                table: "usuarios",
                column: "Login",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "colaboradores");

            migrationBuilder.DropTable(
                name: "unidades");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
