import team from './team'
export default class Player{
    constructor(){
        this.team = team
    }
    info(){
        console.log(this.team.name)
    }
}