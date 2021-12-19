import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-chain-details',
    templateUrl: './chain-details.component.html',
    encapsulation: ViewEncapsulation.None
})

export class ChainDetailsComponent implements OnInit {
    @Input() data: any;
    public propertyNumberType = 'Survey Number';

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
    }
}
