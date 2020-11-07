using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZapWeb.Api.Models
{
    public class Mensagem
    {
        public int Id { get; set; }
        public int GrupoId { get; set; }
        public string Texto { get; set; }
        public int UsuarioId { get; set; }
        public DateTime DataHora { get; set; }
    }
}
