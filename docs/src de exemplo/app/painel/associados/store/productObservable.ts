import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ProdutoState } from '../types/produtos-types';
import logger from '@/lib/logger';

export class ProductObservable {
  private static instance: ProductObservable;
  private stateSubject: BehaviorSubject<ProdutoState>;
  public readonly state$: Observable<ProdutoState>;

  private constructor() {
    this.stateSubject = new BehaviorSubject<ProdutoState>(ProdutoState.INICIAL);
    this.state$ = this.stateSubject.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  // Atualiza estado e loga
  public setState(newState: ProdutoState): void {
    const oldState = this.stateSubject.getValue();
    this.stateSubject.next(newState);
    
    // Log bonito da mudança
    logger.info('Product Observable:', `${ProdutoState[oldState]} → ${ProdutoState[newState]}`);
  }

  // Retorna estado atual
  public getState(): ProdutoState {
    return this.stateSubject.getValue();
  }

  // Factory method
  public static create(): ProductObservable {
    if (!ProductObservable.instance) {
      ProductObservable.instance = new ProductObservable();
    }
    return ProductObservable.instance;
  }
}
