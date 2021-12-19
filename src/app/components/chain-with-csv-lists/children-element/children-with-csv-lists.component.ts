import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-children-with-csv-lists',
    templateUrl: './children-with-csv-lists.component.html',
    encapsulation: ViewEncapsulation.None
})

export class ChildrenWithCSVListsComponent implements OnInit {
    @Input() data: any;
    config: any;
    public showTreeBroken = false;
    public showChildTreeBroken = false;
    public propertyNumberType = 'Survey Number';
    public sameChildren: Array<any> = [];
    public parentsOfSameChildren: Array<any> = [];
    public items: Array<any> = [];

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
        if (this.data && this.data.children && this.data.children.length > 0) {
            this.parentsOfSameChildren = this.data.children.filter((it: any) => it.sameSiblings && it.sameSiblings.length > 0);
            const children = this.data.children.filter((it: any) => !it.sameSiblings || it.sameSiblings.length === 0);
            this.items = [ ...children, ...this.parentsOfSameChildren];
            if (this.parentsOfSameChildren && this.parentsOfSameChildren.length > 0) {
                const lastSiblingParent = this.parentsOfSameChildren[this.parentsOfSameChildren.length - 1];
                this.sameChildren = lastSiblingParent.children.filter((it: any) =>
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
