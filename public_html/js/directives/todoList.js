angular.module("todoList").directive('todoList', function () {
    return {
        scope: {eventBus: "=", type: "@"},
        link: link,
        template: '<table ng-show="store.get(\'itens\').length > 0" class="table">\
                <tr><th  ng-class="\'selecionada\'"`>{{Title}}</th>\
                <th ng-class="\'selecionada\'" colspan="6"><button class=\'buttonRemoveAll\' ng-if=\'type=="concluida"\' ng-click="apagarTerefasConcluidas()">Excluir todas</button></th></tr>\
                <tr><th>Feito</th><th>Tarefa</th><th>Hora Add</th><th>Previsto para</th><th>Hora Fim</th><th>Excluir</th></tr>\
                 <tr class="tr-todo-item" todo-Item event-bus="eventBus" tarefa="tarefa" store="store" \
                 ng-repeat="tarefa in store.get(\'itens\')" ng-show="tarefa.selecionada===mostrar"></tr></table>'
    };
    function link(scope, element) {
        class Store {
            constructor() {
                this.data = {};
                this.listeners = {};
            }
            set(property, value) {
                this.data[property] = value;
                if (this.listeners[property]) {
                    this.listeners[property](value);
                }
            }

            get(property) {
                if (this.data[property]) {
                    return this.data[property];
                }
            }

            subscribe(property, func) {
                this.listeners[property] = func;
            }
        }

        scope.element = element;
        scope.store = new Store();

        scope.mostrar = (scope.type === "pendente" ? false : true);
        scope.Title = (scope.type === "pendente" ? "Tarefas pendentes" : "Tarefas Concluidas");
        scope.adicionarTarefa = function (tarefa) {
            if ((scope.type === "pendente") && (!tarefa.selecionada)) { //adicionando em pendentes
                if (!tarefa.horaFim) {
                    tarefa.horaAdd = (tarefa.horaAdd ? tarefa.horaAdd : new Date());
                    tarefa.selecionada = false;
                    scope.store.get('itens').push(angular.copy(tarefa));
                }
            } else if ((scope.type === "concluida") && (tarefa.selecionada)) { //adicionando em concluidas
                if (tarefa.horaFim) {
                    scope.store.get('itens').push(angular.copy(tarefa));
                }
            }
        };
        scope.store.subscribe("set-todo-item-color", function (tarefaSel) {
            if (scope.type === "concluida" && tarefaSel) {
                var idx = ($(scope.element).find('.tr-todo-item').length - 1);
                if (idx >= 0) {
                    $($(scope.element).find('.tr-todo-item')[idx]).addClass('selecionada');
                    $($(scope.element).find('.tr-todo-item')[idx]).addClass('negrito');
                }
            }
        });
        scope.selecionarTarefa = function (tarefa) {
            if (tarefa) {
                if (scope.type === "concluida") {
                    tarefa.horaFim = new Date();
                } else {
                    tarefa.horaFim = null;
                }
                scope.eventBus.fireEvent("adicionarTarefa", angular.copy(tarefa));
                scope.eventBus.fireEvent("apagarTarefaSel", tarefa);
//                scope.$$postDigest(function () {
                if (scope.type === "concluida") {
                    setTimeout(function () {
                        scope.store.set("set-todo-item-color", tarefa.selecionada);
                    }, 500, false);
//                });
                }
            }
        };
        scope.confirmaApagarTarefa = function (tarefa) {
            if (scope.store.get('itens').includes(tarefa)) {
                if (confirm("Deseja excluir \'" + tarefa.descricao + "\'?")) {
                    delete scope.store.get('itens').splice(scope.store.get('itens').indexOf(tarefa), 1);
                }
            }
        };

        scope.apagarTarefaSel = function (tarefa) {
            if ((scope.type === "pendente") && (tarefa.selecionada)) { // removendo de pendentes
                if (scope.store.get('itens').includes(tarefa)) {
                    delete scope.store.get('itens').splice(scope.store.get('itens').indexOf(tarefa), 1)
                    ;
                }
            } else if ((scope.type === "concluida") && (!tarefa.selecionada)) { // removnedo de concluidas
                if (scope.store.get('itens').includes(tarefa)) {
                    delete scope.store.get('itens').splice(scope.store.get('itens').indexOf(tarefa), 1)
                    ;
                }
            }
        };

        scope.apagarTerefasConcluidas = function () {
            if (confirm("Deseja excluir todas as terefas concluidas?")) {
                scope.store.set('itens', scope.store.get('itens').filter(function (tarefa) {
                    if (!tarefa.selecionada)
                        return tarefa;
                }));
            }
        };

        scope.store.set("itens", []);
        scope.eventBus.addListener("adicionarTarefa", scope.adicionarTarefa);
        scope.eventBus.addListener("selecionarTarefa", scope.selecionarTarefa);
        scope.eventBus.addListener("confirmaApagarTarefa", scope.confirmaApagarTarefa);
        scope.eventBus.addListener("apagarTarefaSel", scope.apagarTarefaSel);
    }

});
