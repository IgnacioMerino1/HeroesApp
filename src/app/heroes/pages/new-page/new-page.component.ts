import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/heroes.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit{

  public heroForm = new FormGroup({
    id:               new FormControl<string>(''),
    superhero:        new FormControl<string>('', { nonNullable: true }),
    publisher:        new FormControl<Publisher>(Publisher.DCComics),
    alter_ego:        new FormControl(''),
    first_appearance: new FormControl(''),
    characters:       new FormControl(''),
    alt_img:          new FormControl(''),
  });

  public publisher = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor( 
    private heroesService: HeroesService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
    ) {}

  ngOnInit(): void {
    if( !this.router.url.includes('edit')) {
      // Estamos el alta de heroe. No hay valores a cargar
      return;
    }

    this.activatedRouter.params
      .pipe(
        // Buscar el heroe
        switchMap( ({id}) => this.heroesService.getHeroById(id) ),
      ).subscribe( hero => {
        // Si no existe el heroe
        if( !hero) return this.router.navigateByUrl('/');

        // Si existe, cargar sus datos
        this.heroForm.reset(hero);
        return;
      })
  }

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;

    return hero;
  }

  onSubmit():void {

    if( this.heroForm.invalid ) return;

    if( this.currentHero.id ) {
      // Actualizar
      this.heroesService.updateHero( this.currentHero )
        .subscribe( hero => {
          // mostrar mensaje
          this.showSnackBar(`${ hero.superhero } actualizado.`);

        });
        
      return;
    } else {
      // nuevo
      this.heroesService.addHero( this.currentHero )
        .subscribe( hero => {
          // mostrar mensaje
          this.showSnackBar(`${ hero.superhero } creado.`);

          // navegar a pagina de edicion del nuevo heroe
          this.router.navigate(['/heroes/edit',hero.id]);
        });
        
      return;
    }
  }

  onDeleteHero():void {
    if( !this.currentHero.id ) throw Error('Id heroe requerido');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });


    dialogRef.afterClosed()
      .pipe(
        filter((result: boolean) => result),
        switchMap(() => this.heroesService.deleteHeroById(this.currentHero.id)),
        filter( (wasDeleted: boolean) => wasDeleted),
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']);
    });

//    dialogRef.afterClosed().subscribe(result => {
//      if(!result) return;
//
//      this.heroesService.deleteHeroById(this.currentHero.id)
//      .subscribe( wasDeleted => {
//        if (wasDeleted) this.router.navigate(['/heroes']);
//      });
//    });
  }

  showSnackBar(message: string):void {
    this.snackbar.open(message, 'Cerrar', {
      duration: 2500,
    })
  }
}
