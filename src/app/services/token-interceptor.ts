import { Injectable } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { Observable, from} from "rxjs";
import { mergeMap } from 'rxjs/operators';

const TOKEN_KEY = 'auth-token';

@Injectable()
export class AddTokenInterceptor implements HttpInterceptor {


    constructor(private storage: Storage) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if(request.url.endsWith('login')) {
            return next.handle(request)
        }

        let promise = this.storage.get(TOKEN_KEY);

        return from(promise)
            .pipe(mergeMap(token => {
                let clonedReq = this.addToken(request, token);
                return next.handle(clonedReq)
            }));
    }

    private addToken(request: HttpRequest<any>, token: any) {
        if (token) {
            let clone: HttpRequest<any>;
            clone = request.clone({
                setHeaders: {
                    Accept: `application/json`,
                    'Content-Type': `application/json`,
                    Authorization: `Bearer ${token}`
                }
            });
            return clone;
        }

        return request;
    }

}
