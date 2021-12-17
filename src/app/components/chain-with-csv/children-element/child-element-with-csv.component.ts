import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-children-with-csv-element',
    templateUrl: './child-element-with-csv.component.html',
    encapsulation: ViewEncapsulation.None
})

export class ChildrenElementWithCSVComponent implements OnInit {
    @Input() data: any;
    config: any;
    public showTreeBroken = false;
    public showChildTreeBroken = false;
    public propertyNumberType = 'Survey Number';
    public isMerge: boolean = false;

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
