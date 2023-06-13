import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environments } from 'src/environments/environments';
import { Hero } from '../interfaces/heroes.interface';

@Injectable({providedIn: 'root'})
export class HeroesService {

    private baseUrl:string = environments.baseUrl;

    constructor(private httpClient: HttpClient) { }
    
    getHeroes():Observable<Hero[]> {
        return this.httpClient.get<Hero[]>(`${ this.baseUrl }/heroes`);
    }

    getHeroById(id: string): Observable<Hero | undefined> {
        return this.httpClient.get<Hero>(`${ this.baseUrl }/heroes/${ id }`)
            .pipe(
                catchError(error => of(undefined))
            );
    }

    getSuggestions ( query: string) : Observable<Hero[]> {

        return this.httpClient.get<Hero[]>(`${ this.baseUrl }/heroes?_limit=6&q=${ query }`);
    }

    addHero( hero: Hero ):Observable<Hero> {
        return this.httpClient.post<Hero>(`${ this.baseUrl }/heroes`,hero);
    }

    updateHero( hero: Hero ):Observable<Hero> {
        if(!hero.id) {
            throw Error('Hero id is required');
        }
        return this.httpClient.patch<Hero>(`${ this.baseUrl }/heroes/${ hero.id }`,hero);
    }

    deleteHeroById( id: string ):Observable<boolean> {
        if(!id) {
            throw Error('Hero id is required');
        }
        return this.httpClient.delete(`${ this.baseUrl }/heroes/${ id }`)
            .pipe(
                map( resp => true),
                catchError( err => of(false) ),
            );
    }

}