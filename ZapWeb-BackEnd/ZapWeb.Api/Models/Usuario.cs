using System.ComponentModel.DataAnnotations.Schema;

namespace ZapWeb.Api.Models
{
 
    public class Usuario
    {
        public int id { get; set; }
        public string apelido { get; set; }
        public string email { get; set; }
        public string senha { get; set; }

        public bool isOnline { get; set; }

        public string connectionsId { get; set; }
    }
}
