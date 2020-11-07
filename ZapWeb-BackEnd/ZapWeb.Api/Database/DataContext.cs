using Microsoft.EntityFrameworkCore;
using System.Reflection;
using ZapWeb.Api.Models;

namespace ZapWeb.Api.Database
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
            
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.EnableSensitiveDataLogging(); 
          
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            base.OnModelCreating(modelBuilder);
           
        }



        public DbSet<Usuario> Usuario { get; set; }
        public DbSet<GrupoUsuario> Grupo { get; set; }
        public DbSet<Mensagem> Mensagem { get; set; }
    }
}
