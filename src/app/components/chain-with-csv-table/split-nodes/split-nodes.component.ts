import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-split-nodes',
    templateUrl: './split-nodes.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class SplitNodesComponent implements OnInit {
    @Input() children: any;

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
    }

    counter(length: number) {
        if (length === 0) {
            return new Array();
        }

        return new Array((length * 2) - 2);
    }
}
