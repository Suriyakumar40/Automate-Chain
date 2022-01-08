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
    public items: Array<any> = [];
    public vchildWidth: string = '';
    public vchildHeight: string = '';
    public horizontalLineWidth: string = '';

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
        const nodeDataDOM = document.getElementById(`node-data`);
        const downLineDOM = document.getElementById(`downLine`);
        const downLineHeight = downLineDOM && downLineDOM.offsetHeight > 0 ? downLineDOM.offsetHeight + 2 : 0;
        this.vchildWidth = nodeDataDOM && `${nodeDataDOM.offsetWidth}px` || '';
        this.vchildHeight = nodeDataDOM && `${nodeDataDOM.offsetHeight + 2}px` || '';
    }

    renderWidth(childItem: any) {
        const nodeDataDOM = document.getElementById(`node-data`);
        return nodeDataDOM && `${nodeDataDOM.offsetWidth}px` || ''
        // const childDOM = document.getElementById(`child_${childItem.child}`);
        // return childDOM && `${childDOM.offsetWidth}px` || '';
    }

    adjustHorizontalLineByPoint(childItem: any) {
        if (childItem.commonChildPoint === 'start') {
            return { width: '50%', float: 'right' };
        } else if (childItem.commonChildPoint === 'end') {
            return { width: '50%', float: 'left' };
        }
        return { width: '100%' };
    }
    
}
