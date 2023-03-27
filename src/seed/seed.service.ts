import { Injectable } from '@nestjs/common';
import axios, {AxiosInstance} from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  //Hacemos visible la dependencia a axios
  private readonly axios: AxiosInstance = axios;

  async executeSeed(){
    //Esto crea una dependencia oculta
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    data.results.forEach( ( {name, url} ) => {
      
      const segments = url.split('/');
      const no = +segments[ segments.length -2 ];

      console.log( { name, no } )
    })
    
    return data.results;
  }
}
