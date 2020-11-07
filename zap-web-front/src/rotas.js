import React from 'react';
import {Switch, Route} from 'react-router-dom';

import CadastroUsuario from './views/usuario/cadastro';
import Login from './views/usuario/login';
import Conversation from './views/conversation/conversation';


export default ()  =>{
    return(
        
            <Switch>
                
                <Route exact path="/" component={Conversation} />
                <Route exact path="/login" component={Login} />   
                <Route exact path="/batepapo" component={Conversation} />             
                <Route exact path="/cadastrar-usuario" component={CadastroUsuario} />  
                        
            </Switch>
      
    );
}