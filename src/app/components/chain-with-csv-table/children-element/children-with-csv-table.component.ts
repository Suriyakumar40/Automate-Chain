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
        // const d1 = document.getElementById('P_horizontal_W');
        // const d2 = document.getElementById('Q_horizontal_W');
        // this.connect(d1, d2, 'green', 5);
        // <div style="padding:0px;margin:0px;border-top: 2px solid #4c9c3c;position:absolute;left:1187.4975000156248px;top: 738.5px;width: 135.005px;"></div>
        
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
        if (childItem.displayEnum === 'commonChildConnector' && childItem.dummyVerticalLine) {
            return `${downLineHeight + nodeDataHeight + splitMergeLineHeight + 4}px`;
        } else if (childItem.displayEnum === 'commonChildConnector') {
            return `${downLineHeight + nodeDataHeight + 2}px`
        } else if (childItem.dummyVerticalLine) {
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

    getOffset(el: any) {
        if (!el) {
            return null;
        }
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    }

    // https://thewebdev.info/2021/09/12/how-to-draw-a-line-between-two-divs-with-javascript/
    connect(div1: any, div2: any, color: any, thickness: any) {
        const off1 = this.getOffset(div1);
        const off2 = this.getOffset(div2);
        debugger
        if (off1 && off2) {
            const x1 = off1.left + off1.width;
            const y1 = off1.top + off1.height;
    
            const x2 = off2.left + off2.width;
            const y2 = off2.top;
    
            const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    
            const cx = ((x1 + x2) / 2) - (length / 2);
            const cy = ((y1 + y2) / 2) - (thickness / 2);
    
            const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
    
            const htmlLine = "<div style='padding:0px; margin:0px; border-top: 2px solid #4c9c3c; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px;' />";
    
            document.body.innerHTML += htmlLine;
        }
    }
}
