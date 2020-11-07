using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZapWeb.Api.Models
{
    public class GrupoUsuario
    {
        public int Id { get; set; }

        public string  Descricao {get; set;}
        public string Usuarios { get; set; }
    }
}
