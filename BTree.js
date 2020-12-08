/* cxx实现的node类 array.insert(index,val)类似于链表 */


/* 在array中寻找小于等于val的最大者的index 如果不存在小于等于，则返回-1 */
Array.prototype.findMaxIndex = function (val) {
    let index = 0;
    while (this[index] <= val) index++;
    return index - 1;
}
/* 在指定的位置上添加元素，之后的元素后移 */
Array.prototype.insert = function (index, val) {
    this.splice(index, 0, val);
}
/* 在指定的位置上删除元素，之后的元素前移 */
Array.prototype.remove = function (index) {
    return this.splice(index, 1)[0];
}

/* B树节点中，key保存的是真正的数据，也就相当于文件 */
class BNode {
    constructor() {
        this.parent = null;/* 指向父节点 */
        this.key = [];      /* 存放元素 */
        this.child = [null];    /* 存放元素的子节点 */
    }

}


class BTree {
    // 维护什么数据 阶
    constructor(order) {
        this.size = 0;      /* 元素的总数 */
        this.order = order; /* B树的阶 */
        this.root = new BNode();   /* B树的根 */
        this.hot = null;    /* search操作最后访问的 */
    }
    /* 查找val元素所在的节点 */
    search(val) {
        let v = this.root; // 从根节点出发逐层查找
        this.hot = null;
        while (v) { // 逐层查找
            let r = v.key.findMaxIndex(val); /* 寻找小于等于val且最接近val的key的index 如果不存在则返回-1 */
            if ((r >= 0) && (val == v.key[r])) return v; /* 如果在key中找到了，就直接返回所在的节点 */
            this.hot = v;/* hot记录search过程中的上一级节点 */
            v = v.child[r + 1];/* 进入对应的子节点中继续寻找 */
        }
        return null;
    }
    /* 添加val的节点 */
    insert(val) {
        let v = this.search(val);
        if (v) return false;
        let r = this.hot.key.findMaxIndex(val);/* 在这一层中寻找最接近的val的index */
        this.hot.key.insert(r + 1, val);
        this.hot.child.insert(r + 2, null);/* 因为此时处于最后一层，往下的节点都是null，所以随意添加null保持子节点和元素的数量关系即可 */
        this.size++;
        this.solveOverflow(this.hot);/* 如果有必要，则进行分裂操作 */
        return true;/* 添加操作成功 */

    }
    /* 添加节点需要考虑如果当前节点不满足B树阶的要求 那么需要将多余的节点添加过去 */
    /* 递归算法 递归地向上分裂 */
    solveOverflow(v) {
        if (v.child.length <= this.order) return;/* 此时节点的元素数量还在合理的范围之内 */
        let s = Math.floor(this.order / 2);/* 中间的轴点 */
        let u = new BNode();
        for (let j = 0; j < this.order - s - 1; j++) {
            u.child.insert(j, v.child.remove(s + 1));/* 分割v并将v的key和child均摊给u */
            u.key.insert(j, v.key.remove(s + 1));
        }
        u.child[this.order - s - 1] = v.child[s + 1];
        v.child.remove(s + 1);
        if (u.child[0])/* u的child都指向u */
            for (let j = 0; j < this.order - s; j++)
                u.child[j].parent = u;
        let p = v.parent;
        if (!p) {/* 如果到达根节点，则新建节点 */
            this.root = p = new BNode();
            p.child[0] = v;
            v.parent = p;
        }
        let r = 1 + p.key.findMaxIndex(v.key[0]);/* 在parent节点中找到合适的位置 */
        p.key.insert(r, v.key.remove(s));/* 从v中删除轴点存入到p中 */
        p.child.insert(r + 1, u);/* u的parent指向p */
        u.parent = p;
        this.solveOverflow(p);/* 继续递归 */
    }
    /* 删除val的节点 */
    remove(val) {
        let v = this.search(val);/* 确定要删除的节点存在 */
        if (!v) return false;
        let r = v.key.findMaxIndex(val);/* 如果存在val，那么找到val所在的超级节点 */
        if (v.child[0]) {/* 如果所在的超级节点不是叶子节点，那么需要交换 */
            let u = v.child[r + 1];
            while (u.child[0])
                u = u.child[0];
            v.key[r] = u.key[0];
            v = u;
            r = 0;
        }
        /* 如果所在的超级节点是叶子节点，那么直接删除即可 */
        v.key.remove(r);/* 删除关键码以及对应的子节点 */
        v.child.remove(r + 1);
        this.size--;
        this.solveUnderflow(v);/* 根据当前节点v是否满足B树对于节点的限制条件，进行旋转或者合并 */
        return true;
    }
    solveUnderflow(v) {/* 在v中的key和child删除了节点之后 节点的数量不再满足B树的要求 需要合并或者旋转 */
        if (Math.floor((this.order + 1) / 2) <= v.child.length)/* 如果当前节点的数量满足下限 则直接删除即可 */
            return;
        let p = v.parent;
        if (p == null) {/* 说明当前v已经是根节点 */
            if (v.key.length == 0 && v.child[0]) {
                this.root = v.child[0];
                this.root.parent = null;
                v.child[0] = null;
                // delete v
            }
            return;
        }
        let r = 0;
        while (p.child[r] != v) r++;/* 确定当前节点v是p的第几个孩子节点 */
        if (r > 0) {/* 有左兄弟，则向左兄弟借 */
            let ls = p.child[r - 1];/* 左旋 左兄弟节点 */
            if (Math.floor((this.order + 1) / 2) < ls.child.length) {/* 如果左兄弟节点可以借出 */
                /* 关键码旋转 */
                v.key.insert(0, p.key[r - 1]);
                p.key[r - 1] = ls.key.remove(ls.key.length - 1);
                /* ls的最右侧孩子节点过继给v作为v的最左侧节点 */
                v.child.insert(0, ls.child.remove(ls.child.length - 1));
                if (v.child[0])
                    v.child[0].parent = v;
                return;
            }
        }/* 否则要么没有左兄弟，要么左兄弟无法借出节点 */
        if (p.child.length - 1 > r) {/* 右旋 有右兄弟，那么向右兄弟借关键码 */
            let rs = p.child[r + 1];
            if (Math.floor((this.order + 1) / 2) < rs.child.length) {/* 右兄弟节点的数量足够多 */
                /* 关键码右旋 */
                v.key.insert(v.key.length, p.key[r]);
                p.key[r] = rs.key.remove(0);
                /* 右兄弟节点的最左侧孩子节点过继给v作为v的最右侧节点 */
                v.child.insert(v.child.length, rs.child.remove(0));
                if (v.child[v.child.length - 1])
                    v.child[v.child.length - 1].parent = v;
                return;
            }
        }
        /* 以上两种情况对应存在兄弟节点的情况，也就是旋转，下面对应的情况是合并 */
        if (r > 0) {/* 当前节点和左兄弟节点合并 */
            let ls = p.child[r - 1];
            /* 父节点p对应的关键码下拉到左兄弟中 */
            ls.key.insert(ls.key.length, p.key.remove(r - 1));
            p.child.remove(r);
            /* v最左侧节点过继给左兄弟 */
            ls.child.insert(ls.child.length, v.child.remove(0));
            if (ls.child[ls.child.length - 1]) {
                ls.child[ls.child.length - 1].parent = ls;
            }
            /* v剩余的关键码和子节点都过继给左兄弟 */
            while (v.key.length) {
                ls.key.insert(ls.key.length, v.key.remove(0));
                ls.child.insert(ls.child.length, v.child.remove(0));
                if (ls.child[ls.child.length - 1]) {
                    ls.child[ls.child.length - 1].parent = ls;
                }
            }
            /* delete v */
        } else {/* 如果没有左兄弟，那么就和右兄弟节点进行合并 */
            let rs = p.child[r + 1];
            /* 关键码下拉到右节点 */
            rs.key.insert(0, p.key.remove(r));
            p.child.remove(r);
            /* v最右侧子节点过继给右兄弟 */
            rs.child.insert(0, v.child.remove(v.child.length - 1));
            if (rs.child[0])
                rs.child[0].parent = rs;
            /* v剩余的关键码和节点都过继给右兄弟 */
            while (v.key.length) {
                rs.key.insert(0, v.key.remove(v.key.length - 1));
                rs.child.insert(0, v.child.remove(v.child.length - 1));
                if (rs.child[0])
                    rs.child[0].parent = rs;
            }
            /* delte v */
        }
        this.solveUnderflow(p);
        return;
    }
    show() {
        let q = [];
        const bfs = () => {
            q.push(this.root);
            while (q.length) {
                let top = q.shift();
                top && console.log(top.key);
                top && q.push(...top.child);
            }
        }
        bfs();
    }
    getTreeData() {
        let DATA = {};
        function dfs(NEW, OLD) {
            if (OLD != null) {
                NEW.value = OLD.key.join(' ');
                if (OLD.child[0]) {
                    NEW.children = Array(OLD.child.length);
                    for (let i = 0; i < OLD.child.length; i++) {
                        NEW.children[i] = {};
                        dfs(NEW.children[i], OLD.child[i]);
                    }
                }
            }
        }
        dfs(DATA, this.root);
        // 最终返回一个对象 value 也就是当前node的key展开 children如果null那么就是一个{}也就是一个Node就继续递归
        return DATA;
    }
    deepCopy(newobj, oldobj) {
        for (var k in oldobj) {
            // 判断我们的属性值属于那种数据类型
            // 1. 获取属性值  oldobj[k]
            var item = oldobj[k];
            // 2. 判断这个值是否是数组
            if (item instanceof Array) {
                newobj[k] = [];
                deepCopy(newobj[k], item)
            } else if (item instanceof Object) {
                // 3. 判断这个值是否是对象
                newobj[k] = {};
                deepCopy(newobj[k], item)
            } else {
                // 4. 属于简单数据类型
                newobj[k] = item;
            }

        }
    }
}

let tree = new BTree(4);
// tree.insert(5);
// tree.insert(6);
// tree.insert(7);
// tree.insert(8);
// tree.insert(9);
// tree.insert(10);
// tree.remove(7);
// tree.insert(78);
// tree.insert(79);

// tree.insert(7);
// tree.insert(13);
// tree.insert(19);
// tree.insert(22);
// tree.insert(25);
// tree.insert(28);
// tree.insert(34);
// tree.insert(43);
// tree.insert(37);
// tree.insert(40);
// tree.insert(41);
// tree.insert(49);
// tree.insert(46);
// tree.insert(52);

tree.insert(19);
tree.insert(28);
tree.insert(40);
tree.insert(46);



// tree.show();
console.log(tree.getTreeData());