import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-split-nodes',
    templateUrl: './split-nodes.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class SplitNodesComponent implements OnInit {
    @Input() children: any;
    public connectorChildIndex: number = -1;

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
    }

    counter(children: Array<any>) {
        this.connectorChildIndex = children ? children.findIndex(it => it.displayEnum === 'commonChildConnector') : -1;
        const length: number = children ? children.length : 0;
        if (length === 0) {
            return new Array();
        }

        return new Array((length * 2) - 2);
    }

    displayLine(pIndex: number) {
        const roundOff = Math.round(pIndex / 2);
        if (this.connectorChildIndex > -1 && this.connectorChildIndex === roundOff) {
            return '';
        } else {
            return pIndex % 2 === 0 ? 'leftLine' : 'rightLine';
        }
        // return pIndex % 2 === 0 ? 'leftLine' : 'rightLine';

    }
}
