using Microsoft.EntityFrameworkCore.Migrations;

namespace ZapWeb.Api.Migrations
{
    public partial class apelido : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "apelido",
                table: "Mensagem",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "apelido",
                table: "Mensagem");
        }
    }
}
