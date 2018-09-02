---
layout: example
title: Pragmatic inference based on compositional semantic meanings
description: Combining pragmatic reasoning with incremental semantic parsing.
---

This model combines and extends the [pragmatics](pragmatics.html) and [semantic parsing](semanticparsing.html) examples.

~~~
var makeObj = function() {
  return {blond: flip(0.5), nice: flip(0.5), tall: flip(0.5)}
}

var worldPrior = function(nObjLeft, meaningFn, worldSoFar, prevFactor) {
  var worldSoFar = worldSoFar==undefined ? [] : worldSoFar
  var prevFactor = prevFactor==undefined ? 0 : prevFactor
  if(nObjLeft==0) {
    factor(-prevFactor)
    return worldSoFar
  } else {
    var newObj = makeObj()
    var newWorld = worldSoFar.concat([newObj])
    var newFactor = meaningFn(newWorld)?0:-100
    factor(newFactor - prevFactor)
    return worldPrior(nObjLeft-1, meaningFn, newWorld, newFactor)
  }
}


////////////////

var meaning = function(utterance) {
  return combine_meanings(filter(function(m){return !(m.sem==undefined)},
                          map(lexical_meaning, utterance.split(" "))))
}

var lexical_meaning = function(word) {

  var wordMeanings = {

    "blond" : {
    sem: function(world){return function(obj){return obj.blond}},
      syn: {dir:'L', int:'NP', out:'S'} },

    "nice" : {
    sem: function(world){return function(obj){return obj.nice}},
      syn: {dir:'L', int:'NP', out:'S'} },

    "tall" : {
    sem: function(world){return function(obj){return obj.tall}},
      syn: {dir:'L', int:'NP', out:'S'} },

    "Bob" : {
    sem: function(world){return find(function(obj){return obj.name=="Bob"}, world)},
      syn: 'NP' },

    "some" : {
    sem: function(world){return function(P){return function(Q){return filter(Q, filter(P, world)).length>0}}},
    syn: {dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
    out:{dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
      out:'S'}} },

    "all" : {
    sem: function(world){return function(P){return function(Q){return filter(neg(Q), filter(P, world)).length==0}}},
    syn: {dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
    out:{dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
      out:'S'}} },

    "none" : {
    sem: function(world){return function(P){return function(Q){return filter(Q, filter(P, world)).length==0}}},
    syn: {dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
    out:{dir:'R',
    int:{dir:'L', int:'NP', out:'S'},
      out:'S'}} }
  }

  var meaning = wordMeanings[word];
  return meaning == undefined?{sem: undefined, syn: ''}:meaning;
}

var neg = function(Q){
  return function(x){return !Q(x)}
}


//assume that both f and a will give their actual semantic value after being applied to a world. make a new meaning that passes on world arg.
var applyWorldPassing = function(f,a) {
  return function(w){return f(w)(a(w))}
}

var combine_meaning = function(meanings) {
  var possibleComb = canApply(meanings,0)
  var i = possibleComb[randomInteger(possibleComb.length)]
  var s = meanings[i].syn
  if (s.dir == 'L') {
    var f = meanings[i].sem
    var a = meanings[i-1].sem
    var newmeaning = {sem: applyWorldPassing(f,a), syn: s.out}
    return meanings.slice(0,i-1).concat([newmeaning]).concat(meanings.slice(i+1))
  }
  if (s.dir == 'R') {
    var f = meanings[i].sem
    var a = meanings[i+1].sem
    var newmeaning = {sem: applyWorldPassing(f,a), syn: s.out}
    return meanings.slice(0,i).concat([newmeaning]).concat(meanings.slice(i+2))
  }
}

//make a list of the indexes that can (syntactically) apply.
var canApply = function(meanings,i) {
  if(i==meanings.length){
    return []
  }
  var s = meanings[i].syn
  if (s.hasOwnProperty('dir')){ //a functor
    var a = ((s.dir == 'L')?syntaxMatch(s.int, meanings[i-1].syn):false) |
    ((s.dir == 'R')?syntaxMatch(s.int, meanings[i+1].syn):false)
    if(a){return [i].concat(canApply(meanings,i+1))}
  }
  return canApply(meanings,i+1)
}


// The syntaxMatch function is a simple recursion to
// check if two syntactic types are equal.
var syntaxMatch = function(s,t) {
  return !s.hasOwnProperty('dir') ? s==t :
  s.dir==t.dir & syntaxMatch(s.int,t.int) & syntaxMatch(s.out,t.out)
}


// Recursively do the above until only one meaning is
// left, return it's semantics.
var combine_meanings = function(meanings){
  return meanings.length==1 ? meanings[0].sem : combine_meanings(combine_meaning(meanings))
}


//////////////

var utterancePrior = function() {
  var utterances = ["some of the blond people are nice",
                    "all of the blond people are nice",
                    "none of the blond people are nice"]
  var i = randomInteger(utterances.length)
  return utterances[i]
}


//////////////

var isall = function(world){return world.length==0 ?1: (world[0].blond?world[0].nice:1)&isall(world.slice(1))}

var literalListener = cache(function(utterance) {
  Enumerate(function(){
            var m = meaning(utterance)
            var world = worldPrior(2,m)
            factor(m(world)?0:-Infinity)
            return world
            }, 100)
})

var speaker = cache(function(world) {
  Enumerate(function(){
    var utterance = utterancePrior()
    var L = literalListener(utterance)
    factor(L.score([],world))
    return utterance
  }, 100)
})


var listener = function(utterance) {
  Enumerate(function(){
    var world = worldPrior(2, function(w){return 1}) //use vacuous meaning to avoid any guide...
//    var world = worldPrior(2, meaning(utterance)) //guide by literal meaning
    var S = speaker(world)
    factor(S.score([],utterance))
    return isall(world)
  }, 100)
}

// literalListener("some of the blond people are nice")
// speaker([{blond: true, nice: true, tall: false}])

print(listener("some of the blond people are nice"))
~~~
