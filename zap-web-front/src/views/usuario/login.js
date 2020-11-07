import React, {Component} from 'react'
import '../../style.css';
import logo from '../../imagens/logo.png';
import * as signalR from '@aspnet/signalr';


class Login extends Component{
    constructor(props){
        super(props);

        this.state={
            email:'',
            senha:''
        }

        this.loginResponse = this.loginResponse.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }

    componentDidMount() {

        let usuario = JSON.parse(localStorage.getItem("Logado"));

        if(usuario!=null)
            this.props.history.push('/batepapo')

        this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:30195/zapwebHub")
         //.withHubProtocol(protocol)
        .build();
         // .fail(err=> console.log(err.toString()));
       
        this.connection.on('LoginResponse', this.loginResponse);
         //connection.on('ReceberPromocao', this.onReceberPromocao);


        this.connection.start({credentials:true})
        .then(function() { 
              console.info('SignalR Connected');
             
        })
        .catch(err => console.error('SignalR Connection Error: ', err));
    }

    loginResponse(usuario, mensagem){
       if(usuario==null)
            this.mensagemErro=mensagem;
        else{

            //Guardar no localstorage
            localStorage.setItem("Logado", JSON.stringify(usuario));    

            this.props.history.push('/batepapo')
            
            /**
            let state = this.state;
            state.apelido='';
            state.email='';
            state.senha='';
            this.setState(state);
            **/
        }
        
    }


    onLogin(ev){
        let state = this.state;
        console.log("state: ",state)
        this.connection.invoke("Login",state.email,state.senha)
        .then(()=>{
            state.email='';
            state.senha='';
            this.setState(state);
           //console.log("state: ",state)
            
        })
        .catch((erro)=>{
            console.log("Erro ao executar CadastrarUsuario "+erro.toString())
        });
        
        ev.preventDefault();    
    }


    render(){
        return(
            <>
            <div className="container-login">
                <img src={logo} />
                <h1>ZapWeb</h1>
                <div>{this.mensagemErro}</div>
                <div className="container-form">
                    <input type="text" placeholder="E-mail" onChange={(ev) =>{this.setState({email:ev.target.value})  } } />
                    <br />
                    <input type="password" placeholder="Senha" onChange={(ev) =>{this.setState({senha:ev.target.value}) }} />
                    
                    <div className="container-button">
                        <input type="button" value="ACESSAR" onClick={this.onLogin} />
                        <input type="button" value="CADASTRAR"/>
                    </div>
                </div>
            </div>
            </>
        );
    }
}


export default Login;