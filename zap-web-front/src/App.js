import React,{Component} from 'react';
import Rotas from './rotas';


import {HashRouter} from 'react-router-dom';

class App extends Component{
  
    constructor(props){
      super(props);
    }

  

    render(){
        return(
            <div>
                
            {
            
            <HashRouter>
                <Rotas/>
            </HashRouter>
            
           }

             </div>
        );
    }
}


export default App;
