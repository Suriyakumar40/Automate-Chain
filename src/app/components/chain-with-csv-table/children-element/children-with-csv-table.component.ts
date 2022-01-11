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
    @Input() splitLine: any;
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
        const nodeDataWidth = this.getNodeDataWidth();
        const nodeDataHeight = this.getNodeDataHeight();
        this.vchildWidth = `${nodeDataWidth}px`;
        this.vchildHeight = nodeDataHeight ? `${nodeDataHeight + 2}px` : '';
    }

    adjustHorizontalLineByPoint(childItem: any) {
        if (childItem.commonChildPoistion === 'start') {
            return { width: '50%', float: 'right' };
        } else if (childItem.commonChildPoistion === 'end') {
            return { width: '50%', float: 'left' };
        }
        return { width: '100%' };
    }

    adjustVerticalLine(childItem: any) {
        const nodeDataHeight = this.getNodeDataHeight();
        const downLineHeight = this.getDownLineHeight();
        const splitMergeLineHeight = this.getSplitOrMergeLineConnector();
        if (childItem.displayEnum === 'commonChildConnector') {
            return `${downLineHeight + nodeDataHeight + 2}px`
        }
        if (childItem.dummyVerticalLine) {
            return `${downLineHeight + splitMergeLineHeight + 2}px`;
        } 
        return `${downLineHeight}px`;
    }

    getDownLineHeight() {
        const downLineDOM = document.getElementById(`downLine`);
        return downLineDOM && downLineDOM.offsetHeight > 0 ? downLineDOM.offsetHeight : 0
    }

    getNodeDataHeight() {
        const nodeDataDOM = document.getElementById(`node-data`);
        return nodeDataDOM && nodeDataDOM.offsetHeight > 0 ? nodeDataDOM.offsetHeight : 0
    }

    getNodeDataWidth() {
        const nodeDataDOM = document.getElementById(`node-data`);
        return nodeDataDOM && nodeDataDOM.offsetWidth > 0 ? nodeDataDOM.offsetWidth : 0
    }

    getSplitOrMergeLineConnector() {
        return 24;
    }
}
