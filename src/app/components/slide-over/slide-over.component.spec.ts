import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SlideOverComponent } from './slide-over.component';

@Component({
  standalone: true,
  imports: [SlideOverComponent],
  template: `<app-slide-over [title]="title" (closed)="onClosed()"><p class="projected">conteúdo</p></app-slide-over>`,
})
class HostComponent {
  public title: string = 'Editar presente';
  public closedCount: number = 0;

  public onClosed(): void {
    this.closedCount++;
  }
}

describe('SlideOverComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.classList.remove('modal-open');
  });

  it('renderiza o título recebido via input', () => {
    const h2: HTMLElement = fixture.nativeElement.querySelector('.slide-over-header h2');
    expect(h2.textContent!.trim()).toBe('Editar presente');
  });

  it('projeta o conteúdo no corpo do painel', () => {
    const projected: HTMLElement = fixture.nativeElement.querySelector('.slide-over-body .projected');
    expect(projected).toBeTruthy();
    expect(projected.textContent).toContain('conteúdo');
  });

  it('trava o scroll do body enquanto aberto e libera ao destruir', () => {
    expect(document.body.classList.contains('modal-open')).toBe(true);
    fixture.destroy();
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('emite closed ao clicar no botão fechar', () => {
    fixture.debugElement.query(By.css('.slide-over-close')).nativeElement.click();
    expect(host.closedCount).toBe(1);
  });

  it('emite closed ao clicar no backdrop', () => {
    fixture.debugElement.query(By.css('.slide-over-backdrop')).nativeElement.click();
    expect(host.closedCount).toBe(1);
  });

  it('NÃO emite closed ao clicar dentro do painel', () => {
    fixture.debugElement.query(By.css('.slide-over-panel')).nativeElement.click();
    expect(host.closedCount).toBe(0);
  });

  it('emite closed ao pressionar Esc', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.closedCount).toBe(1);
  });
});
