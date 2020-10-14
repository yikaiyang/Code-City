import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface FilterState {
  excludedFiles: string[];
  excludedAuthors: string[];
}

export function createInitialState(): FilterState {
  return {
    excludedFiles: [],
    excludedAuthors: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'filter' })
export class FilterStore extends Store<FilterState> {
  
  constructor() {
    super(createInitialState());
  }

}
