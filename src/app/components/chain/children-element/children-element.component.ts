import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-children-element',
    templateUrl: './children-element.component.html',
    encapsulation: ViewEncapsulation.None
})

export class ChildrenNodeComponent implements OnInit {
    @Input() data: any;
    @Input() chainColumnWrapEnabled = false;
    config: any;
    public showTreeBroken = false;
    public showChildTreeBroken = false;
    public propertyNumberType = 'Survey Number';

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
