using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZapWeb.Api.Database;
using ZapWeb.Api.Models;

namespace ZapWeb.Api.Hubs
{
    public class ZapWebHub : Hub
    {
        private DataContext _context;

        public ZapWebHub(DataContext context)
        {
            _context = context;
        }

        public async Task CadastrarUsuario(Usuario usuario)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(usuario.email))
                    throw new Exception("O email precisa ser informado!");
                if (string.IsNullOrWhiteSpace(usuario.senha))
                    throw new Exception("A senha informação ser informado!");
                if (string.IsNullOrWhiteSpace(usuario.apelido))
                    throw new Exception("O apelido precisa ser informado!");


                bool usuarioExistente = (await _context.Usuario.Where(x => x.email == usuario.email).CountAsync()) > 0;
                if (usuarioExistente)
                    throw new Exception("Usuário já existente!");

                await _context.Usuario.AddAsync(usuario);
                var comit = await _context.SaveChangesAsync();
                if (comit == 0)
                    throw new Exception("Erro desconhecido");

                await Clients.Caller.SendAsync("CadastrarUsuarioResponse", usuario);
                //await Clients.All.SendAsync("ReceberUsuario", usuario);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("CadastrarUsuarioResponse", null, "Não foi possível salvar o usuario. Erro:" + ex.Message);
            }
        }



        public async Task Login(string email, string senha)
        {

            try
            {
                var usuario = await _context.Usuario.FirstOrDefaultAsync(x => x.email == email && x.senha==senha);

                if (usuario == null)
                    throw new Exception("Usuário e/ou senha inexistente!");


                
                await Clients.Caller.SendAsync("LoginResponse", usuario);
                await Clients.AllExcept(Context.ConnectionId).SendAsync("GetListaUsuariosResponse", usuario);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("LoginResponse", null, "Não foi possível logar. Erro:" + ex.Message);
            }
        }

        public async Task AtualizarConnectionId(Usuario usuario, bool inserir=true)
        {
            var usuarioDb = await _context.Usuario.FindAsync(usuario.id);
            if (usuarioDb != null) 
            {
                var connectionId = Context.ConnectionId;

                var listaId = !string.IsNullOrWhiteSpace(usuarioDb.connectionsId) ? JsonConvert.DeserializeObject<List<string>>(usuarioDb.connectionsId) : new List<string>();

                if (!listaId.Contains(connectionId) && inserir){
                    usuarioDb.isOnline = true;
                    listaId.Add(connectionId);
                    //await AddConectionIdGrupo(usuarioDb.email, listaId);
                    //await Clients.AllExcept(connectionId).SendAsync("GetListaUsuariosResponse", usuario);
                }
                else if (listaId.Contains(connectionId) && !inserir){
                    usuarioDb.isOnline = false;
                    listaId.Remove(connectionId);
                    await RemoveConectionIdGrupo(usuarioDb.email, listaId);

                }

                usuarioDb.connectionsId = JsonConvert.SerializeObject(listaId);

                _context.Usuario.Update(usuarioDb);

                var comit = await _context.SaveChangesAsync();

                if (comit == 0)
                    throw new Exception("Erro ao registrar o connection id");

                var usuarios = await _context.Usuario.ToListAsync();
                await Clients.AllExcept(Context.ConnectionId).SendAsync("GetListaUsuariosResponse", usuarios);

            }

        }


        public async Task GetListaUsuarios()
        {
            var usuarios = await _context.Usuario.ToListAsync();

            await Clients.All.SendAsync("GetListaUsuariosResponse", usuarios);
        }

        public async Task CriarAbrirGrupo(string emailUsuarioLogado, string emailUsuarioConvocado)
        {
            try
            {
                var listaEmail = new List<string>() { emailUsuarioLogado, emailUsuarioConvocado }.OrderBy(x => x).ToList();
                string nomeDoGrupo = string.Join('-', listaEmail);

                var grupo = await _context.Grupo.FirstOrDefaultAsync(x => x.Descricao == nomeDoGrupo);

                if (grupo == null)
                {
                    grupo = new GrupoUsuario()
                    {
                        Descricao = nomeDoGrupo,
                        Usuarios = JsonConvert.SerializeObject(listaEmail)
                    };

                    await _context.AddAsync(grupo);
                    var comit = await _context.SaveChangesAsync();
                    if (comit == 0)
                        throw new Exception("Falha ao criar o grupo");

                }


                var usuarios = await _context.Usuario.Where(x => listaEmail.Contains(x.email)).ToListAsync();
                var usuarioLogado = usuarios.Where(x => x.email == emailUsuarioLogado).FirstOrDefault();


                foreach (var usuario in usuarios)
                {
                    if (string.IsNullOrWhiteSpace(usuario.connectionsId))
                        continue;

                    var conectionIds = JsonConvert.DeserializeObject<List<string>>(usuario.connectionsId);

                    if (usuario.id == usuarioLogado.id && !conectionIds.Contains(Context.ConnectionId))
                        conectionIds.Add(Context.ConnectionId);

                    await AddConectionIdGrupo(usuario.email, conectionIds);

                    
                }

                var usuarioConvocado = usuarios.Where(x => x.email == emailUsuarioConvocado).FirstOrDefault();

                var mensagens = await _context.Mensagem.Where(x => x.GrupoId == grupo.Id).ToArrayAsync();

                await Clients.Caller.SendAsync("CriarAbrirGrupoResponse", new {nomeGrupo=nomeDoGrupo, emailUsuarioConvocado= emailUsuarioConvocado, apelido= usuarioConvocado?.apelido, mensagens = mensagens, grupoId=grupo.Id });


                var conectionsIdConvocado = JsonConvert.DeserializeObject<List<string>>(usuarioConvocado.connectionsId);
                foreach(var con in conectionsIdConvocado) 
                    await Clients.Client(con).SendAsync(
                        "CriarAbrirGrupoResponse", 
                        new { nomeGrupo = nomeDoGrupo,
                              grupoId = grupo.Id,
                              emailUsuarioConvocado = emailUsuarioConvocado, 
                              mensagens = mensagens,
                              apelido = usuarioLogado?.apelido 
                           }
                   );
            }
            catch(Exception ex)
            {
                Clients.Caller.SendAsync("CriarGrupoResponse",null, "Erro:" + ex.Message);
            }
            
            
        }

        public async Task AddConectionIdGrupo(string emailUsuario, List<string> listaConections)
        {
            var grupos = await _context.Grupo.Where(x => x.Usuarios.Contains(emailUsuario)).ToListAsync();

            foreach (var grupo in grupos)
            {
                foreach (var conectionId in listaConections) {
                    await Groups.AddToGroupAsync(conectionId, grupo.Descricao);
                }
            }

        }

        public async Task RemoveConectionIdGrupo(string emailUsuario, List<string> listaConections)
        {

            var grupos = await _context.Grupo.Where(x => x.Usuarios.Contains(emailUsuario)).ToListAsync();

            foreach (var grupo in grupos)
            {
                foreach (var conectionId in listaConections)                
                    await Groups.RemoveFromGroupAsync(conectionId, grupo.Descricao);
                
            }

        }

        public async Task SalvarMensagem(int usuarioId, int GrupoId, string texto )
        {
            var usuario = await _context.Usuario.FindAsync(usuarioId);

            var mensagem = new Mensagem()
            {
                Texto = texto,
                DataHora = DateTime.UtcNow,
                UsuarioId = usuarioId,
                GrupoId = GrupoId,
                apelido = usuario.apelido
            };

            await _context.Mensagem.AddAsync(mensagem);
            var comit = await _context.SaveChangesAsync();
            if (comit == 0)
                await Clients.Caller.SendAsync("EnviarMensagemResponse", null, "Erro ao enviar mensagens");


            var grupo = await _context.Grupo.Where(x => x.Id == GrupoId).FirstOrDefaultAsync();

            await Clients.GroupExcept(grupo.Descricao, Context.ConnectionId).SendAsync("EnviarMensagemResponse", mensagem);

        }

    }
}
