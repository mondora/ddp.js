describe("The _on_nosub private method", function () {

	describe("receives as only argument an object containing the properties id and an optional error, and", function () {

		describe("if error is defined", function () {

			describe("if an error handler exists", function () {

				it("should call the error handler with error as first argument", function () {
					var ddp = new DDP(optionsDontAutoconnect);
					var obj = {
						id: "0",
						error: {}
					};
					var cb = sinon.spy();
					ddp._onErrorCallbacks[0] = cb;
					ddp._on_nosub(obj);
					cb.calledWith(obj.error).should.be.true;
				});

			});

			describe("if an error handler doesn't exist", function () {

				it("should throw the error", function () {
					var ddp = new DDP(optionsDontAutoconnect);
					var obj = {
						id: "0",
						error: {}
					};
					var cb = sinon.spy();
					var troublemaker = function () {
						ddp._on_nosub(obj);
					};
					troublemaker.should.throw(obj.error);
				});

			});

			it("should delete all handlers for the subscription", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {}
				};
				ddp._onReadyCallbacks[0] = _.noop;
				ddp._onStopCallbacks[0] = _.noop;
				ddp._onErrorCallbacks[0] = _.noop;
				ddp._on_nosub(obj);
				_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onStopCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onErrorCallbacks[0]).should.be.true;
			});

		});

		describe("if error is not defined", function () {

			it("should call the stop handler", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0"
				};
				var cb = sinon.spy();
				ddp._onStopCallbacks[0] = cb;
				ddp._on_nosub(obj);
				cb.called.should.be.true;
			});

			it("should delete all handlers for the subscription", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0"
				};
				ddp._onReadyCallbacks[0] = _.noop;
				ddp._onStopCallbacks[0] = _.noop;
				ddp._onErrorCallbacks[0] = _.noop;
				ddp._on_nosub(obj);
				_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onStopCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onErrorCallbacks[0]).should.be.true;
			});

		});

	});

});
