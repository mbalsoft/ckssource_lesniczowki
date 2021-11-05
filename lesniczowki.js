
function zadanie( input_matrix ) {
    forest_lodges = find_all_forester_lodges( input_matrix );

    // get first forest's lodge
    first_forest_lodge = get_random_element_from_array( forest_lodges );

    // using Dijkstra algorithm find paths and costs to every one field
    let dresult = dijkstra( input_matrix, first_forest_lodge );

    // get the second one forest's lodge
    let next_forest_lodge = get_random_element_from_array( forest_lodges );
    // using calculated for first lodge paths find the chiper path
    let result_paths = find_path( dresult, first_forest_lodge, [next_forest_lodge]);
    // repeat for rest forest's lodges
    while( forest_lodges.length > 0 ) {
        // get next forest's lodge
        next_forest_lodge = get_random_element_from_array( forest_lodges );
        // for this lodge calculate paths to fields
        dresult = dijkstra( input_matrix, next_forest_lodge );
        // from existng paths between used lodges choose field whith the lowest cost
        let connection_point = find_the_best_connection_point( result_paths, dresult );
        // get the path between lodge and the best connection point
        let path2 = find_path( dresult, next_forest_lodge, [connection_point]);
        // add new path to the result
        result_paths = contact_pths( result_paths, path2 );
    }
    return result_paths;
}

// ==========================================================================

function find_all_forester_lodges( forest_matrix ) {
    result = [];
    forest_matrix.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            if( col == "L" ) {
                result.push({ x : col_idx, y : row_idx });
            }
        });
    });
    return result;
}

// fuction return list of nodes around node - max 4
function find_neiber_nodes( graph, node ) {
    result = [];
    for( let i = -1; i <= 1; i++ ) {
        for( let j = -1; j <= 1; j++ ) {
            if( i != j && ((i == 0) || (j == 0))) {
                if( node.x + i >= 0 && node.x + i < graph[ 0 ].length 
                 && (node.y + j >= 0 && node.y + j < graph.length)
                 && (graph[ node.y + j ][ node.x + i ] != null)) {
                    result.push({ x : node.x + i, y : node.y + j, value : graph[ node.y + j ][ node.x + i ] });
                }
            }
        }
    }
    return result;
}

// function returns graph (array[][]) with min. costs and paths to every one field from start_node
function dijkstra( main_graph, start_node ) {
    // prepare result matrix d - fields set to undefined except start_node position - set to 0
    let d = clone_graph( main_graph );
    // graph it's clone input matrix for calculate costs and mark visited fields
    let graph = clone_graph( main_graph );
    graph.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            if( col_idx == start_node.x && row_idx == start_node.y) {
                d[ row_idx ][ col_idx ] = { x : col_idx, y : row_idx, value : 0 };
            }
            else {
                d[ row_idx ][ col_idx ] = undefined;
                if( col == "L" ) {
                    graph[ row_idx ][ col_idx ] = 0;
                }
            }
        });
    });
    // main loop - up to calculate every one field
    start_node.value = 0;
    let node_list = [ start_node ];
    while( node_list.length > 0 ) {
        let new_nodes = [];
        // sub loop - for provided set of fields calculate costs to neiber fields
        node_list.forEach( node => {
            let node_value = d[ node.y ][ node.x ].value;
            // get list of neiber fields - it's max. 4
            const neiber_nodes = find_neiber_nodes( graph, node );
            // if cost to field is lower - modify field in result matrix - d
            neiber_nodes.forEach( tmp_node => {
                if( ! d[ tmp_node.y ][ tmp_node.x ] || d[ tmp_node.y ][ tmp_node.x ].value > tmp_node.value + node_value ) {
                    d[ tmp_node.y ][ tmp_node.x ] = { ...node };
                    d[ tmp_node.y ][ tmp_node.x ].value = node_value + tmp_node.value;
                }
            });
            new_nodes = new_nodes.concat( neiber_nodes );
        });
        // mark calculated fileds
        node_list.forEach( node => {
            graph[ node.y ][ node.x ] = null;
        });
        // clone neiber fileds to next step of main loop
        node_list = [];
        new_nodes.forEach( node => {
            node_list.push({ ...node });
        });
    }
    // result - d - matrix with fields - value = costs and x, y position of predict field
    return d;
}

// result is matrix with 0 or 1 on every positions
// using 1 are marked optimal path from start_node to end_node
// this function arg graph it is result of dijkstra function
function find_path( graph, start_node, end_nodes ) {
    let result = clone_graph( graph );
    result.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            result[ row_idx ][ col_idx ] = 0;
        });
    });
    end_nodes.forEach( end_node => {
        result[ end_node.y ][ end_node.x ] = 1;
        walker = { x : graph[ end_node.y ][ end_node.x ].x, y : graph[ end_node.y ][ end_node.x ].y };
        while( walker.x != start_node.x || walker.y != start_node.y ) {
            result[ walker.y ][ walker.x ] = 1;
            walker = { x : graph[ walker.y ][ walker.x ].x, y : graph[ walker.y ][ walker.x ].y };
        }
    });
    result[ start_node.y ][ start_node.x ] = 1;
    return result;
}

// paths - 0, 1 matrix, where by 1 are marked paths betwen forest's lodges
// graph - result of dijkstra function
// function check field marked 1 and return the chipest field position
function find_the_best_connection_point( paths, graph ) {
    let min_cost = undefined;
    let result   = undefined;
    paths.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            if( col == 1 ) {
                const value = graph[ row_idx ][ col_idx ] == "L" ? 0 : graph[ row_idx ][ col_idx ];
                if( ! min_cost || min_cost > value ) {
                    min_cost = value;
                    result = { x : col_idx, y : row_idx };
                }
            }
        });
    });
    return result;
}

function contact_pths( path1, path2 ) {
    const result = clone_graph( path1 );
    path1.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            if( col == 1 || path2[ row_idx ][ col_idx] == 1 ) {
                result[ row_idx ][ col_idx ] = 1;
            }
            else {
                result[ row_idx ][ col_idx ] = 0;
            }
        });
    });
    return result;
}

//====================== TOOLS ==========================================

function load_input_file( file_name ) {
    const fs = require('fs')
    let result = [];

    try {
        let jsonString = String( fs.readFileSync( file_name ));
        while( jsonString.indexOf( "'" ) >= 0 ) {
            jsonString = jsonString.replace( "'", '"' );
        }
        result = JSON.parse( jsonString );
    } catch( err ) {
        console.log( err );
        return;
    }
    return result;
}

function clone_graph( graph ) {
    return JSON.parse( JSON.stringify( graph ));
}

function calculate_costs( paths, graph ) {
    let result = 0;
    paths.forEach( (row, row_idx) => {
        row.forEach( (col, col_idx) => {
            if( col == 1 ) {
                result += graph[ row_idx ][ col_idx ] == "L" ? 0 : graph[ row_idx ][ col_idx ];
            }
        });
    });
    return result;
}

function get_random_element_from_array( in_array ) {
    const index = Math.floor( Math.random() * in_array.length );
    const element = in_array[ index ];
    in_array.splice( index, 1 );
    return element;
}

//====================== MAIN ============================================

let myArgs = process.argv.slice( 2 );

input_matrix = load_input_file( myArgs[ 0 ]);

console.log( input_matrix );
console.log( "" );

result_paths = zadanie( input_matrix );

console.log( "\n===============\n", result_paths );
console.log( calculate_costs( result_paths, input_matrix ));
