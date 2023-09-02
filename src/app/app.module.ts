import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getFirestore } from 'firebase/firestore';
// import { provideFirestore } from '@angular/fire/firestore';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    TransactionsModule,
    RouterModule.forRoot([
      {path: '', redirectTo:'/login', pathMatch:'full'},
      {path: '**', component:NotFoundComponent}
    ]),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
