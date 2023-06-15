import { ApEdition, ApFlagId } from '@activepieces/shared';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';

type FlagsMap = Record<string, boolean | string | object | undefined>;

@Injectable({
  providedIn: 'root',
})
export class FlagService {
  flags$: Observable<FlagsMap> | undefined;
  privateFlags$: Observable<FlagsMap> | undefined;

  constructor(private http: HttpClient,
    private authenticationService: AuthenticationService) { }

  private getPublicFlags() {
    if (!this.flags$) {
      this.flags$ = this.http
        .get<FlagsMap>(environment.apiUrl + '/flags')
        .pipe(shareReplay(1));
    }
    return this.flags$;
  }

  private getPrivateFlags(): Observable<FlagsMap> {
    if (!this.authenticationService.isLoggedIn()) {
      return of({});
    }
    if (!this.privateFlags$) {
      this.privateFlags$ = this.http
        .get<FlagsMap>(environment.apiUrl + '/flags')
        .pipe(shareReplay(1));
    }
    return this.privateFlags$;
  }

  isFirstSignIn() {
    return this.getPublicFlags().pipe(
      map((value) => {
        return !value['USER_CREATED'];
      })
    );
  }

  getWarningMessage(): Observable<
    { title?: string; body?: string } | undefined
  > {
    return this.getPublicFlags().pipe(
      map((flags) => {
        const warningTitle: string | undefined = flags[
          'WARNING_TEXT_HEADER'
        ] as string | undefined;
        const warningBody: string | undefined = flags['WARNING_TEXT_BODY'] as
          | string
          | undefined;
        if (warningTitle || warningBody) {
          return {
            title: warningTitle,
            body: warningBody,
          };
        }
        return undefined;
      })
    );
  }

  isSignedUpEnabled(): Observable<boolean> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        const firstUser = flags['USER_CREATED'] as boolean;
        if (!firstUser) {
          return true;
        }
        return flags['SIGN_UP_ENABLED'] as boolean;
      })
    );
  }

  isTelemetryEnabled(): Observable<boolean> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags['TELEMETRY_ENABLED'] as boolean;
      })
    );
  }

  getWebhookUrlPrefix(): Observable<string> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.WEBHOOK_URL_PREFIX] as string;
      })
    );
  }

  isCloudAuthEnabled(): Observable<boolean> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.CLOUD_AUTH_ENABLED] as boolean;
      })
    );
  }
  getEdition(): Observable<ApEdition> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.EDITION] as ApEdition;
      })
    );
  }

  getRelease(): Observable<string> {
    return this.getPrivateFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.CURRENT_VERSION] as string;
      })
    );
  }

  getLatestRelease(): Observable<string> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.LATEST_VERSION] as string;
      })
    );
  }

  getSandboxTimeout(): Observable<number> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return Number(flags[ApFlagId.SANDBOX_RUN_TIME_SECONDS]);
      })
    );
  }

  getEnvironment(): Observable<string> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.ENVIRONMENT] as string;
      })
    );
  }

  getFrontendUrl(): Observable<string> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.FRONTEND_URL] as string;
      })
    );
  }

  getTemplatesSourceUrl(): Observable<string> {
    return this.getPublicFlags().pipe(
      map((flags) => {
        return flags[ApFlagId.TEMPLATES_SOURCE_URL] as string;
      })
    );
  }
}
