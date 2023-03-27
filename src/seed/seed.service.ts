import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import axios, {AxiosInstance} from 'axios';

import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}

  async executeSeed(){

    await this.pokemonModel.deleteMany({}); // delete * from pokemons;

    //Esto crea una dependencia oculta
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    // const insertPromisesArray = [];

    // data.results.forEach( ( {name, url} ) => {
      
    //   const segments = url.split('/');
    //   const no = +segments[ segments.length -2 ];

    //   // const pokemon = await this.pokemonModel.create( {name, no} );

    //   // console.log( { name, no } )

    //   insertPromisesArray.push(
    //     this.pokemonModel.create( { name, no } )
    //   );

    // })

    // await Promise.all( insertPromisesArray );

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach( ( { name, url } ) => {
      
      const segments = url.split('/');
      const no = +segments[ segments.length -2 ];

      pokemonToInsert.push({name, no}); // [{name: bulbasaur, no:1}]
      
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    //insert into pokemons (name, no)
    //Multiples insercionesss
    return 'Seed Executed';
  }
}
