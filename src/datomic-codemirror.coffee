###
Author: Shaun Gilchrist
Branched from Hans Engel's Clojure mode
###
CodeMirror.defineMode "datomic", (config, mode) ->
  hooks = config.mode.hooks or {}
  makeKeywords = (str) ->
    obj = {}
    words = str.split(" ")
    i = 0

    while i < words.length
      obj[words[i]] = true
      ++i
    obj
  
  # Built-ins
  
  # Binding forms
  
  # Data structures
  
  # clojure.test
  
  # contrib
  stateStack = (indent, type, prev) -> # represents a state stack object
    @indent = indent
    @type = type
    @prev = prev
  pushStack = (state, indent, type) ->
    state.indentStack = new stateStack(indent, type, state.indentStack)
  popStack = (state) ->
    state.indentStack = state.indentStack.prev
  isNumber = (ch, stream) ->
    
    # hex
    if ch is "0" and stream.eat(/x/i)
      stream.eatWhile tests.hex
      return true
    
    # leading sign
    if (ch is "+" or ch is "-") and (tests.digit.test(stream.peek()))
      stream.eat tests.sign
      ch = stream.next()
    if tests.digit.test(ch)
      stream.eat ch
      stream.eatWhile tests.digit
      if "." is stream.peek()
        stream.eat "."
        stream.eatWhile tests.digit
      if stream.eat(tests.exponent)
        stream.eat tests.sign
        stream.eatWhile tests.digit
      return true
    false
  BUILTIN = "builtin"
  COMMENT = "comment"
  STRING = "string"
  TAG = "tag"
  ATOM = "atom"
  NUMBER = "number"
  BRACKET = "bracket"
  KEYWORD = "keyword"
  SYMBOL = "symbol"
  INDENT_WORD_SKIP = 2
  KEYWORDS_SKIP = 1
  atoms = makeKeywords("true false nil")
  keywords = makeKeywords("defn defn- def def- defonce defmulti defmethod defmacro defstruct deftype defprotocol defrecord defproject deftest slice defalias defhinted defmacro- defn-memo defnk defnk defonce- defunbound defunbound- defvar defvar- let letfn do case cond condp for loop recur when when-not when-let when-first if if-let if-not . .. -> ->> doto and or dosync doseq dotimes dorun doall load import unimport ns in-ns refer try catch finally throw with-open with-local-vars binding gen-class gen-and-load-class gen-and-save-class handler-case handle")
  builtins = makeKeywords("* *1 *2 *3 *agent* *allow-unresolved-vars* *assert *clojure-version* *command-line-args* *compile-files* *compile-path* *e *err* *file* *flush-on-newline* *in* *macro-meta* *math-context* *ns* *out* *print-dup* *print-length* *print-level* *print-meta* *print-readably* *read-eval* *source-path* *use-context-classloader* *warn-on-reflection* + - / < <= = == > >= accessor aclone agent agent-errors aget alength alias all-ns alter alter-meta! alter-var-root amap ancestors and apply areduce array-map aset aset-boolean aset-byte aset-char aset-double aset-float aset-int aset-long aset-short assert assoc assoc! assoc-in associative? atom await await-for await1 bases bean bigdec bigint binding bit-and bit-and-not bit-clear bit-flip bit-not bit-or bit-set bit-shift-left bit-shift-right bit-test bit-xor boolean boolean-array booleans bound-fn bound-fn* butlast byte byte-array bytes case cast char char-array char-escape-string char-name-string char? chars chunk chunk-append chunk-buffer chunk-cons chunk-first chunk-next chunk-rest chunked-seq? class class? clear-agent-errors clojure-version coll? comment commute comp comparator compare compare-and-set! compile complement concat cond condp conj conj! cons constantly construct-proxy contains? count counted? create-ns create-struct cycle dec decimal? declare definline defmacro defmethod defmulti defn defn- defonce defstruct delay delay? deliver deref derive descendants destructure disj disj! dissoc dissoc! distinct distinct? doall doc dorun doseq dosync dotimes doto double double-array doubles drop drop-last drop-while empty empty? ensure enumeration-seq eval even? every? extend extend-protocol extend-type extends? extenders false? ffirst file-seq filter find find-doc find-ns find-var first float float-array float? floats flush fn fn? fnext for force format future future-call future-cancel future-cancelled? future-done? future? gen-class gen-interface gensym get get-in get-method get-proxy-class get-thread-bindings get-validator hash hash-map hash-set identical? identity if-let if-not ifn? import in-ns inc init-proxy instance? int int-array integer? interleave intern interpose into into-array ints io! isa? iterate iterator-seq juxt key keys keyword keyword? last lazy-cat lazy-seq let letfn line-seq list list* list? load load-file load-reader load-string loaded-libs locking long long-array longs loop macroexpand macroexpand-1 make-array make-hierarchy map map? mapcat max max-key memfn memoize merge merge-with meta method-sig methods min min-key mod name namespace neg? newline next nfirst nil? nnext not not-any? not-empty not-every? not= ns ns-aliases ns-imports ns-interns ns-map ns-name ns-publics ns-refers ns-resolve ns-unalias ns-unmap nth nthnext num number? odd? or parents partial partition pcalls peek persistent! pmap pop pop! pop-thread-bindings pos? pr pr-str prefer-method prefers primitives-classnames print print-ctor print-doc print-dup print-method print-namespace-doc print-simple print-special-doc print-str printf println println-str prn prn-str promise proxy proxy-call-with-super proxy-mappings proxy-name proxy-super push-thread-bindings pvalues quot rand rand-int range ratio? rational? rationalize re-find re-groups re-matcher re-matches re-pattern re-seq read read-line read-string reify reduce ref ref-history-count ref-max-history ref-min-history ref-set refer refer-clojure release-pending-sends rem remove remove-method remove-ns repeat repeatedly replace replicate require reset! reset-meta! resolve rest resultset-seq reverse reversible? rseq rsubseq satisfies? second select-keys send send-off seq seq? seque sequence sequential? set set-validator! set? short short-array shorts shutdown-agents slurp some sort sort-by sorted-map sorted-map-by sorted-set sorted-set-by sorted? special-form-anchor special-symbol? split-at split-with str stream? string? struct struct-map subs subseq subvec supers swap! symbol symbol? sync syntax-symbol-anchor take take-last take-nth take-while test the-ns time to-array to-array-2d trampoline transient tree-seq true? type unchecked-add unchecked-dec unchecked-divide unchecked-inc unchecked-multiply unchecked-negate unchecked-remainder unchecked-subtract underive unquote unquote-splicing update-in update-proxy use val vals var-get var-set var? vary-meta vec vector vector? when when-first when-let when-not while with-bindings with-bindings* with-in-str with-loading-context with-local-vars with-meta with-open with-out-str with-precision xml-seq")
  indentKeys = makeKeywords("ns fn def defn defmethod bound-fn if if-not case condp when while when-not when-first do future comment doto locking proxy with-open with-precision reify deftype defrecord defprotocol extend extend-protocol extend-type try catch " + "let letfn binding loop for doseq dotimes when-let if-let " + "defstruct struct-map assoc " + "testing deftest " + "handler-case handle dotrace deftrace")
  tests =
    digit: /\d/
    digit_or_colon: /[\d:]/
    hex: /[0-9a-f]/i
    sign: /[+-]/
    exponent: /e/i
    keyword_char: /[^\s\(\[\;\)\]]/
    basic: /[\w\$_\-]/
    lang_keyword: /[\w*+!\-_?:\/\.]/

  startState: ->
    indentStack: null
    indentation: 0
    mode: false

  token: (stream, state) ->
    
    # update indentation, but only if indentStack is empty
    state.indentation = stream.indentation()  if not state.indentStack? and stream.sol()
    
    # skip spaces
    return null  if stream.eatSpace()
    returnType = null
    switch state.mode
      when "string" # multi-line string parsing mode
        next = undefined
        escaped = false
        while (next = stream.next())?
          if next is "\"" and not escaped
            state.mode = false
            break
          escaped = not escaped and next is "\\"
        returnType = STRING # continue on in string mode
      else # default parsing mode
        ch = stream.next()
        if ch is "\""
          state.mode = "string"
          returnType = STRING
        else if ch is "'" and not (tests.digit_or_colon.test(stream.peek()))
          returnType = ATOM
        else if ch is ";" # comment
          stream.skipToEnd() # rest of the line is a comment
          returnType = COMMENT
        else if isNumber(ch, stream)
          returnType = NUMBER
        else if ch is "(" or ch is "["
          keyWord = ""
          indentTemp = stream.column()
          letter = undefined
          
          ###
          Either
          (indent-word ..
          (non-indent-word ..
          (;something else, bracket, etc.
          ###
          keyWord += letter  while (letter = stream.eat(tests.keyword_char))?  if ch is "("
          if keyWord.length > 0 and (indentKeys.propertyIsEnumerable(keyWord) or /^(?:def|with)/.test(keyWord)) # indent-word
            pushStack state, indentTemp + INDENT_WORD_SKIP, ch
          else # non-indent word
            # we continue eating the spaces
            stream.eatSpace()
            if stream.eol() or stream.peek() is ";"
              
              # nothing significant after
              # we restart indentation 1 space after
              pushStack state, indentTemp + 1, ch
            else
              pushStack state, indentTemp + stream.current().length, ch # else we match
          stream.backUp stream.current().length - 1 # undo all the eating
          returnType = BRACKET
        else if ch is ")" or ch is "]"
          returnType = BRACKET
          popStack state  if state.indentStack? and state.indentStack.type is ((if ch is ")" then "(" else "["))
        else if ch is ":"
          stream.eatWhile tests.lang_keyword
          return ATOM + (hooks[":"]?(stream.current()) or "")
        else if ch is "?"
          stream.eatWhile tests.basic
          return SYMBOL + (hooks["?"]?(stream.current()) or "")
        else
          stream.eatWhile tests.basic
          if keywords and keywords.propertyIsEnumerable(stream.current())
            returnType = KEYWORD
          else if builtins and builtins.propertyIsEnumerable(stream.current())
            returnType = BUILTIN
          else if atoms and atoms.propertyIsEnumerable(stream.current())
            returnType = ATOM
          else
            returnType = null
    returnType

  indent: (state, textAfter) ->
    return state.indentation  unless state.indentStack?
    state.indentStack.indent


CodeMirror.defineMIME "text/x-clojure", "datomic"
