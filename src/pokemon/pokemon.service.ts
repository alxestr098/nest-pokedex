import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model} from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    //Sirve para poder inyectar modelos en este servicio
    //El modelo es de tipo entidad pokemon y le estamos dando el nombre para inyectarlo
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto);
      return pokemon;

    } catch (error) {
      this.handleException( error );
    }
    
  }

  findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;
    
    return this.pokemonModel.find()
      .limit( limit )
      .skip( offset )
      .sort({
        no: 1
      })
      .select('-__v')
  }

  async findOne(term: string) {
    //Esta variable es de tipo de mi entidad
    let pokemon : Pokemon

    if( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({no: term})
    }

    //MongoID
    // si el pokemon aun no existe y es un object id
    if( !pokemon && isValidObjectId( term ) ){
      pokemon = await this.pokemonModel.findById( term );
    }

    //Name
    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne( { name: term.toLowerCase().trim() })
    }

    if( !pokemon )
      throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found"`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
      try {
      await pokemon.updateOne( updatePokemonDto )
      return {...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleException( error );
    }
    //new envia los nuevos datos
    
  }

  async remove(id: string) {
    // const pokemon = await this.findOne (id );
    // await pokemon.deleteOne();
    // return {id};
    // const result = this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount} = await this.pokemonModel.deleteOne({_id: id})
    if( deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found.`)
    }
    return;
  }

  private handleException( error: any ){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs.`);
  }
}
