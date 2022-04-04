var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const grid_size = 30;
const canvasW = canvas.width;
const canvasH = canvas.getBoundingClientRect().height;
console.log(canvasW,(canvasW/grid_size));
var size = canvasW/grid_size;

function priority_queue(){
    var heap = new Array();
    var s = 0;
    var insert_heap = function(el){
        let i  = s;
        heap[i] = el;
        
        let parent = (index)=> Math.floor((index-1)/2);
        while (i!=0 && heap[parent(i)].pr > el.pr) {
           let tmp = heap[i];
           heap[i] = heap[parent(i)];   
           heap[parent(i)] = tmp;
           i = parent(i);
        }
        s++;
        
    }
    this.empty = function(){
        return s==0;
    }

    
    var heapify = function(j){
        let i = j;
        let smallest = i;
        while(true){
            let left = 2*i+1;
            let right = 2*i+2;
            if (left < s && heap[left].pr < heap[i].pr) {
                smallest = left;
              } else {
                smallest = i;
              }
              if (right < s && heap[right].pr < heap[smallest].pr) {
                smallest = right;
              }
        
              if (smallest == i) {
                break;
              }
              let tmp = heap[i];
              heap[i] = heap[smallest];
              heap[smallest] = tmp;
                        
              i = smallest;
        }
    }

    this.dequeue = function(){
        console.log(s);
        if(s<=0) return null;
        if(s==1){
            s--;
            return heap[0].obj;
        }
        let ret = heap[0];
        heap[0] = heap.pop();
         s--;
        heapify(0);
        return ret.obj;     
    }

    this.enqueue = function(object,priority){
        var wrapper= {
            pr: priority,
            obj: object
        };
        insert_heap(wrapper);
    }

}




function square(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xcoord = Math.floor(this.x/size);
    this.ycoord = Math.floor(this.y/size);
    this.wall = false;
    this.visited = false;
    this.gscore = Infinity;
    this.came_from = null;
    this.fscore = null;
    this.neighbours = new Array();

    this.draw = function(){
        ctx.strokeRect(this.x,this.y,this.w,this.h);
    }
    this.marked = function(){
        ctx.fillStyle = 'rgba(237, 164, 17)';
        ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.strokeRect(this.x,this.y,this.w,this.h);

    }
    this.visit = function(){
        //visited = true;
        this.marked();
    }
    this.on_path = function(){
        ctx.fillStyle = 'rgba(245, 78, 66)';
        ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.strokeRect(this.x,this.y,this.w,this.h);
    }
    this.clear = function(){
        ctx.clearRect(this.x,this.y,this.w,this.h);
        this.draw();
    }
    this.select  = function(){
        if(!this.wall){
           ctx.fillStyle = 'rgba(50, 78, 168)';
           ctx.fillRect(this.x,this.y,this.w,this.h);
           ctx.strokeRect(this.x,this.y,this.w,this.h);
    
           this.wall = true;
        }else{
            this.wall = false;
            ctx.clearRect(this.x,this.y,this.w,this.h);
            this.draw();
        }
    }
}

var grid = new Array();
for(let i = 0;i<grid_size;i++){
    var row = new Array();
    for (let j = 0; j < grid_size; j++) {
        row.push(new square(j*(size),i*(size),(size),(size)));
        row[j].draw();
    }
    grid.push(row);
}

canvas.addEventListener("click",function(event){
var x = Math.floor(event.offsetX/size);
var y = Math.floor(event.offsetY/size);
console.log(x,y,event.offsetX,event.offsetY);

grid[y][x].select();
    
});

canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    var x = Math.floor(event.offsetX/size);
    var y = Math.floor(event.offsetY/size);
    grid[y][x].marked();
    
    return false;
}, false);

function compute_neigbours(){
for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
 
        if (i>0 && i<grid_size-1){
            grid[i][j].neighbours.push(grid[i-1][j]);
            grid[i][j].neighbours.push(grid[i+1][j]);
        }
        if(j>0&&j<grid_size-1){
            grid[i][j].neighbours.push(grid[i][j-1]);
            grid[i][j].neighbours.push(grid[i][j+1]);
        }

        if(i==0){
            grid[i][j].neighbours.push(grid[i+1][j]);
        }
        if(i == grid_size-1){
            grid[i][j].neighbours.push(grid[i-1][j]);
        }
        if(j==0){
            grid[i][j].neighbours.push(grid[i][j+1]);
        }
        if( j == grid_size-1){
            grid[i][j].neighbours.push(grid[i][j-1]);
        }
        
        grid[i][j].neighbours = grid[i][j].neighbours.filter(neighbour => neighbour.wall==false);
    }   
}
}

function astar(begin,goal,h){
    var discovered = new priority_queue();
    let start = begin;
    start.visited = true;
    start.gscore = 0;
    start.fscore = start.gscore + h(start,goal); //heuristics 1 == dijsktra
    discovered.enqueue(start,start.fscore);
    while(!discovered.empty()){
        let current = discovered.dequeue();
        //current.visit();
        if(current == goal ){
            console.log("Found path!",current,current.came_from);
            let tmp = current;
            
            while(tmp.came_from!=null){
                tmp.on_path();
                tmp = tmp.came_from;
            }
            return;
        }
        current.neighbours.forEach(neigbour => {
            let tentative_gscore = current.gscore + 1 //1 is edge weight from current to neigbour
            if (tentative_gscore < neigbour.gscore){
                neigbour.came_from = current;
                neigbour.gscore = tentative_gscore;
                neigbour.fscore = neigbour.gscore + h(start,goal); //1 is heuristics
               
                if (!neigbour.visited){
                    neigbour.visited = true;
                    discovered.enqueue(neigbour,neigbour.fscore);
                    
                }
            }     
        });       

    }
}
function reset(){
    for (let i = 0; i < grid_size; i++) {
        for (let j = 0; j < grid_size; j++) {
            grid[i][j].visited = false;
            grid[i][j].gscore = Infinity;
            grid[i][j].came_from = null;
            grid[i][j].fscore = null;
            grid[i][j].wall = false;
            grid[i][j].clear();
     
           
        }   
    }




}

function start(){
    compute_neigbours();
    astar(grid[0][0],grid[29][29],(j,k) => 0);
}

