import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-children-with-csv-table',
    templateUrl: './children-with-csv-table.component.html',
    styleUrls: ['./children-with-csv-table.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ChildrenWithCSVTableComponent implements OnInit {
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
        // for (const child of this.data.children) {
        //     if (child.sameChildren.length) {
        //         const rootDomElement = document.getElementById(`root_${child.parent}`);
        //         const height = rootDomElement && rootDomElement.offsetHeight || 0;
        //         child['bottomLineAutoHeight'] = `${height}px`;
        //     }
        // }
        // if (this.data && this.data.sameChildren.length > 0 && this.data.children.length > 0) {
        //     for (const item of this.data.children) {
        //         const index = this.data.sameChildren.findIndex((s: any) => s === item.child);
        //         if (index > -1) {
        //             this.data.children.splice(index, 1);
        //         }   
        //     }
        // }
        // if (this.data && this.data.children && this.data.children.length > 0) {
        //     this.parentsOfSameChildren = this.data.children.filter((it: any) => it.sameChildren && it.sameChildren.length > 0);
        //     const children = this.data.children.filter((it: any) => !it.sameChildren || it.sameChildren.length === 0);
        //     this.items = [...children, ...this.parentsOfSameChildren];
        //     if (this.parentsOfSameChildren && this.parentsOfSameChildren.length > 0) {
        //         const lastSiblingParent = this.parentsOfSameChildren[this.parentsOfSameChildren.length - 1];
        //         this.sameChildren = lastSiblingParent.children.filter((it: any) =>
        //             lastSiblingParent.sameChildren.some((last: any) => last === it.child));
        //     }
        // }
    }

    positioningClass(child: any): string {
        if (this.data.children.length > 1) {
            return '';
        }
        if (child.needToPositioning && child.childrenCount > 1) {
            return 'align-right-33';
        } else if (child.needToPositioning && child.childrenCount <= 1) {
            return 'align-right-50';
        }
        if (child.sameChildren.length > 0) {
            child['bottomLineAutoHeight'] = this.autoHeight(child);
        }
        return '';
    }

    adjustHeight(childItem: any) {
        const defaultHeight = 20;
        if (childItem.connectorChildren.length === 0) {
            return `${defaultHeight}px`;
        }
        const result = childItem.connectorChildren.map((connectorChild: any) => {
            const currentChildDomElement = document.getElementById(`child_data_${childItem.child}`);
            const childDomElement = document.getElementById(`child_data_${connectorChild}`);
            const currentChildDomElementHeight: number = currentChildDomElement && currentChildDomElement.offsetHeight || 0;
            const childDomElementHeight: number = childDomElement && childDomElement.offsetHeight || 0;
            const height = childDomElementHeight - currentChildDomElementHeight;
            return height > 0 ? height : 0;
        });
        const height = Math.max(result);
        return `${defaultHeight+height}px`;
    }

    autoHeight(child: any) {
        const defaultHeight = '20px';
        if (child.sameChildren.length === 0) {
            return defaultHeight;
        }
        const rootDomElement = document.getElementById(`root_${child.parent}`);
        const childDomElement = document.getElementById(`child_${child.child}`);
        const rootElementHeight: number = rootDomElement && rootDomElement.offsetHeight || 0;
        const childElementHeight: number = childDomElement && childDomElement.offsetHeight || 0;
        const height = rootElementHeight - childElementHeight;
        return height > 20 ? `${height - 80}px` : defaultHeight;
    }
}
