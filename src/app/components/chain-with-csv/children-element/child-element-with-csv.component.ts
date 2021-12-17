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
    public isSameSibling: boolean = false;
    public siblingParents: Array<any> = [];
    public siblingChilds: Array<any> = [];

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
        if (this.data && this.data.children && this.data.children.length > 0) {
            this.siblingParents = this.data.children.filter((it: any) => it.sameSiblings && it.sameSiblings.length > 0);
            if (this.siblingParents && this.siblingParents.length > 0) {
                this.isSameSibling = true;
                const lastSiblingParent = this.siblingParents[this.siblingParents.length - 1];
                this.siblingChilds = lastSiblingParent.children.filter((it: any) =>
                    lastSiblingParent.sameSiblings.some((last: any) => last === it.child));
            }
        }
    }

    counter(length: number) {
        if (length === 0) {
            return new Array();
        }

        return new Array((length * 2) - 2);
    }
}
