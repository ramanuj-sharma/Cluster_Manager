import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, min, Observable, of, take } from 'rxjs';
import { Key } from 'src/api/Key';
import { DataModel, DataPool, ProcessConfig } from 'src/api/Data';
import { Cluster } from 'src/api/Map';

import { ApiService } from './api.service';

let url = "/api/"

describe('ApiService', () => {
  let service: ApiService;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    }).compileComponents();
    service = TestBed.inject(ApiService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Testing of the API functionality when testing the backend
  
  /*it('should connect to backend', () => {
    //@ts-ignore
    const res = service._getServerOnline().pipe(take(1)).toPromise();
    expect(res).toBeTruthy();
  });*/
});
