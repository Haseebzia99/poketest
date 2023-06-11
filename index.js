#!/usr/bin/env node 
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import axios from "axios";

const sleep = (ms=1000) => new Promise((resolve) => setTimeout(resolve, ms))

async function welcome(){
    const rainbowTitle = chalkAnimation.rainbow("Welcome to the Pokemon encyclopedia \n")
    await sleep();
    rainbowTitle.stop();

    console.log(
        `I'm an encyclopedia for all your Pokemon evolution needs\nSearch for a pokemon & I'll do the rest\n`
    )
    await sleep();
    const result = await askForPokemonName();
    console.log(JSON.stringify(result, null, 2));
}

async function askForPokemonName(){
    const answer = await inquirer.prompt({
        name: "pokemon_Name",
        type: "input",
        message: "Search for a Pokemon",
        default(){
            return "pikachu"
        },
    }).catch(err => {
        console.error(err.message)
    });

    const pokemonName = answer.pokemon_Name.toLowerCase();
    return await getPokemon(pokemonName)

}
async function getPokemonId(name){
    try{
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}/`);
        const {id} = response.data;
        return id

    }catch(err){
        err
    }
}

async function getEvolutions(chain){
    if (chain["evolves_to"] == []){
        return []
    }
    return {
        "name": chain["species"]["name"],
        "variants": chain["evolves_to"][0] ? [await getEvolutions(chain["evolves_to"][0])] : []
    }
}

async function getPokemonSpecies(id){
    try{
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
        const {evolution_chain} = response.data;
        const evolutionChainResponse = await axios.get(evolution_chain.url);
        const {chain} = evolutionChainResponse.data;

        return await getEvolutions(chain)

    }catch(err){
        err
    }
}

async function getPokemon(pokemonName){
    try{
        const pokemonId = await getPokemonId(pokemonName) 
        const pokemonSpecies = await getPokemonSpecies(pokemonId)
        
        return pokemonSpecies

    }catch(err){
        err
    }
}

welcome()
